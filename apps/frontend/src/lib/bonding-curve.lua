---=============== BONDING CURVE BOILERPLATE ===============
--- This code can be used as a starting point to create a bonding curve on AO

--- A bare minimum of functionality is provided, namely
---   - buy&sell functionality
---   - a migration to a Botega AMM upon reaching a target

--- You may want to reorganize and further refine functionality, in order to
---   - track the curve events
---   - manage the Botega AMM LP tokens that result from the migration
---   - provide convenience handlers for frontend interactions


-- =================
-- libs: require where needed
local bint                  = require(".bint")(4096) -- gives us 1234 digits for safe power calculations and fractionalizing
local json                  = require("json")

-- =========================
-- curve calc.lua

local calc                  = {}

calc.FRACTIONAL_PRECISION   = 160 -- ! see scaleCurveM() for why this precision scaling needs to be so high
calc.PRICE_PRECISION        = bint.ipow(10, 18)

---The curve configuration that can be mathematically derived
---from the frontend-provided configuration
calc.curveDerivedConfig     = function()
  local n = 1 / CurveRR - 1
  local targetPrice = bint.udiv(TargetMarketCap * calc.PRICE_PRECISION, TargetSupply)
  local targetLiquidity = bint.udiv(TargetMarketCap * math.floor(CurveRR * 10000), 10000)
  return {
    n = n,
    targetPrice = targetPrice,
    targetLiquidity = targetLiquidity
  }
end

---scale the curve's m constant, initially calculated by the UI,
---considering, that the UI config is denomination agnostic
calc.scaleCurveM            = function(initialM)
  ---the curveM from UI config is at least 1e-40, based on the curve target values and the RR configuration

  ---here we scale curveM by an order of magnitude of 18 * 6.66 - 12 in the worst case, which means ~ 10^108

  ---combined, we have the requirement of
  ---  curveM > 1e-148
  --- ! => we account for this when fractionalizing floats in curve calculation
  --- Safer to add 10 more orders of magnitude, i.e. 10 ^ 160
  --- => our fractionalization will use a scaling of this magnitude in order to maintain precision

  local magnitude = ISSUED_TOKEN_DENOMINATION * (CurveN + 1) - QUOTE_TOKEN_DENOMINATION
  return initialM / 10 ^ (magnitude)
end

---Amount of reserves (quote token) required to be paid into the curve
---in order for it to issue given supply (issued token)
---@param supply bint
---@return bint
calc.cost                   = function(supply)
  --[[
    Formula
    cost(supply) = (m / (n + 1)) * supply ^ (n + 1)

    We must operate on bints => conversions and bint arithmetic are required

    We convert as late as possible (only to work on what can not be computed with floating point arithmetic)
  ]]
  local n = CurveN
  local m = CurveM

  -- Naming (m / (n+1)) as "left" and supply ^ (n+1) as "power"

  local numLeft, denLeft = calc.bintFraction(m / (n + 1), calc.FRACTIONAL_PRECISION)
  -- use the fact that n + 1 == RR
  local numPower = calc.bintExpInvRR(supply)

  return bint.udiv(
    numLeft * numPower,
    denLeft
  )
end

---Continuous price reached by the curve given a supply of issued token
---
--- Formula
--- price(S) = m * supply ^ n
---
---@param supply bint
---@return bint
calc.price                  = function(supply)
  local m = CurveM

  local numM, denM = calc.bintFraction(m, calc.FRACTIONAL_PRECISION)
  -- Naming supply ^ n as "power"
  local numPower = calc.bintExpCurveN(supply)

  return bint.udiv(
    numM * numPower * calc.PRICE_PRECISION,
    denM
  )
end

---Supply that is reached via a given amount of reserves being accumulated
---
--- Formula
--- supplyForCost(cost) = (((n+1) * cost) / m) ^ (1 / (n+1))
---
---@param cost bint
---@return bint
calc.supplyForCost          = function(cost)
  local n = CurveN
  local m = CurveM

  --[[
    We need base ^ exp with
    base = ((n + 1) * cost) / m
    exp = 1 / (n+1) = RR

    1. Calculate base with integer arithmetic
    2. Exponentiate ^ RR with integer arithmetic
  ]]

  -- 1.
  local floatFactor = (n + 1) / m
  local num1, den1 = calc.bintFraction(floatFactor, calc.FRACTIONAL_PRECISION)

  local base = bint.udiv(
    num1 * cost,
    den1
  )

  -- 2.
  return calc.bintExpRR(base)
end

---@param amount bint
---@return bint, bint
calc.deductFee              = function(amount)
  local fee = bint.udiv(amount * CurveFee, 10000)
  return amount - fee, fee
end

---Inverse operation of taking a trading fee from an amount
---@param amountWithoutFee bint
calc.addFee                 = function(amountWithoutFee)
  return bint.udiv(
    amountWithoutFee * 10000,
    10000 - CurveFee
  )
end

---Calculate the issued token output obtained when
---buying from the curve while paying given quote token amount
---@param inputQty bint
---@return bint
calc.getOutputForBuy        = function(inputQty)
  local reserveBeforeBuy = CurveReserve
  local reserveAfterBuy = reserveBeforeBuy + inputQty
  local supplyAfterBuy = calc.supplyForCost(reserveAfterBuy)
  local supplyBeforeBuy = CurveSupply
  return supplyAfterBuy - supplyBeforeBuy
end

---Calculate the quote token output obtained when
---selling to the curve while paying given issued token amount
---@param inputQty bint
---@return bint
calc.getOutputForSell       = function(inputQty)
  local reserveBeforeSell = CurveReserve
  local supplyBeforeSell = CurveSupply
  local supplyAfterSell = supplyBeforeSell - inputQty
  local reserveAfterSell = calc.cost(supplyAfterSell)
  return reserveBeforeSell - reserveAfterSell
end

-- Calculate effective price of a trade
---@param inputQty bint
---@param outputQty bint
---@return bint price scaled with 10^18
calc.getEffectivePrice      = function(inputQty, outputQty)
  return bint.udiv(
    inputQty * bint.ipow(10, 18),
    outputQty
  )
end

-- CURVE CALC UTILS

---Express a float as numerator and denominator with a 4 decimal precision
---@param float number should be small enough so that precision + (number of digits of float) < 154
---@param precision number integer with number of digits of precision
---@return (bint, bint) The numerator and denominator
calc.bintFraction           = function(float, precision)
  local numerator = bint(string.format("%.0f", float * 10 ^ precision))
  local denominator = bint.ipow(10, precision)
  return numerator, denominator
end

---Express the RR as a fraction, using heuristics that leverage the discreet set of possible values
---@return (bint, bint) The numerator and denominator
calc.rrExponentFraction     = function()
  -- instead of the generic bint fraction that does exp * 100 / 100,
  -- use custom values in order to have smaller numbers
  if CurveRR == 0.15 then
    --  0.15 = 0.15 * 20 / 20 = 3 / 20
    return bint(3), bint(20)
  elseif CurveRR == 0.2 then
    -- 0.2  = 0.2  *  5 / 5 = 1 / 5
    return bint(1), bint(5)
  elseif CurveRR == 0.25 then
    -- 0.25 = 0.25 *  4 / 4 = 1 / 4
    return bint(1), bint(4)
  elseif CurveRR == 0.3 then
    -- 0.3  = 0.3  * 10 / 10 = 3 / 10
    return bint(3), bint(10)
  elseif CurveRR == 0.35 then
    -- 0.35 = 0.35 * 20 / 20 = 7 / 20
    return bint(7), bint(20)
  elseif CurveRR == 0.4 then
    -- 0.4  = 0.4  *  5 / 5 = 2 / 5
    return bint(2), bint(5)
  elseif CurveRR == 0.45 then
    -- 0.45 = 0.45 * 20 / 20 = 9 / 20
    return bint(9), bint(20)
  elseif CurveRR == 0.5 then
    -- 0.5  = 0.5  *  2 / 2 = 1 / 2
    return bint(1), bint(2)
  else
    error("Unsupported CurveRR value: " .. tostring(CurveRR))
  end
end

---Express 1 / RR as a fraction, using heuristics that leverage the discreet set of possible values
---@return (bint, bint) The numerator and denominator
calc.invRRExponentFraction  = function()
  -- instead of the generic bint fraction that does exp * 100 / 100,
  -- use custom values in order to have smaller numbers
  if CurveRR == 0.15 then
    -- 0.15 = 0.15 * 20 / 20 = 3 / 20   => 1 / RR = 20 / 3
    return bint(20), bint(3)
  elseif CurveRR == 0.2 then
    -- 0.2  = 0.2  *  5 / 5 = 1 / 5   =>  1 /RR = 5 / 1
    return bint(5), bint(1)
  elseif CurveRR == 0.25 then
    -- 0.25 = 0.25 *  4 / 4 = 1 / 4   =>  1 /RR = 4 / 1
    return bint(4), bint(1)
  elseif CurveRR == 0.3 then
    -- 0.3  = 0.3  * 10 / 10 = 3 / 10   => 1 / RR = 10 / 3
    return bint(10), bint(3)
  elseif CurveRR == 0.35 then
    -- 0.35 = 0.35 * 20 / 20 = 7 / 20   => 1 / RR = 20 / 7
    return bint(20), bint(7)
  elseif CurveRR == 0.4 then
    -- 0.4  = 0.4  *  5 / 5 = 2 / 5   =>  1 /RR = 5 / 2
    return bint(5), bint(2)
  elseif CurveRR == 0.45 then
    -- 0.45 = 0.45 * 20 / 20 = 9 / 20   => 1 / RR = 20 / 9
    return bint(20), bint(9)
  elseif CurveRR == 0.5 then
    -- 0.5  = 0.5  *  2 / 2 = 1 / 2   =>  1 /RR = 2 / 1
    return bint(2), bint(1)
  else
    error("Unsupported CurveRR value: " .. tostring(CurveRR))
  end
end

---Express CurveN, which is == (1 / RR-1), as a fraction, using
---heuristics that leverage the discreet set of possible values
---@return (bint, bint) The numerator and denominator
calc.curveNExponentFraction = function()
  -- instead of the generic bint fraction that does exp * 100 / 100,
  -- use custom values in order to have smaller numbers
  if CurveRR == 0.15 then
    --  0.15 = 0.15 * 20 / 20 = 3 / 20  => 1 / RR = 20 / 3  => 1 / RR - 1 = 17 / 3
    return bint(17), bint(3)
  elseif CurveRR == 0.2 then
    -- 0.2  = 0.2  *  5 / 5 = 1 / 5   => 1 / RR = 5 / 1   => 1 / RR - 1 = 4 / 1
    return bint(4), bint(1)
  elseif CurveRR == 0.25 then
    -- 0.25 = 0.25 *  4 / 4 = 1 / 4   => 1 / RR = 4 / 1   => 1 / RR - 1 = 3 / 1
    return bint(3), bint(1)
  elseif CurveRR == 0.3 then
    -- 0.3  = 0.3  * 10 / 10 = 3 / 10   => 1 / RR = 10 / 3  => 1 / RR - 1 = 7 / 3
    return bint(7), bint(3)
  elseif CurveRR == 0.35 then
    -- 0.35 = 0.35 * 20 / 20 = 7 / 20   => 1 / RR = 20 / 7  => 1 / RR - 1 = 13 / 7
    return bint(13), bint(7)
  elseif CurveRR == 0.4 then
    -- 0.4  = 0.4  *  5 / 5 = 2 / 5   => 1 / RR = 5 / 2   => 1 / RR - 1 = 3 / 2
    return bint(3), bint(2)
  elseif CurveRR == 0.45 then
    -- 0.45 = 0.45 * 20 / 20 = 9 / 20   => 1 / RR = 20 / 9  => 1 / RR - 1 = 11 / 9
    return bint(11), bint(9)
  elseif CurveRR == 0.5 then
    -- 0.5  = 0.5  *  2 / 2 = 1 / 2   => 1 / RR = 2 / 1   => 1 / RR - 1 = 1 / 1
    return bint(1), bint(1)
  else
    error("Unsupported CurveRR value: " .. tostring(CurveRR))
  end
end

---Returns floor( x^(1/n) ) for x up to any bit-size,
---without ever converting the bint to a number.
---Uses integer Newton's method, with an initial guess
---derived from the number of digits in x.
calc.nthRootBintNewton      = function(x, n)
  -- Make sure x and n are bints or at least convertible
  x = bint.new(x)
  local n_i = bint.tointeger(n) -- safe if n <= 50
  assert(n_i >= 1, "Root must be >= 1")
  assert(not x:isneg(), "Cannot compute root of negative number")
  if x:iszero() or x:isone() or n_i == 1 then
    return x
  end

  -- 1) Estimate number of decimal digits in x
  --    We do: d = #tostring(x)
  --    Example: if x = 12345, d=5.
  local s = tostring(x) -- decimal representation
  local d = #s
  if s:sub(1, 1) == '-' then
    -- shouldn't happen since x:isneg() is disallowed, but just in case...
    d = d - 1
  end

  -- 2) Derive an "order of magnitude" guess based on digits
  --    guess ~ 10^(floor((d-1)/n_i)).
  --    The (d-1) is so that e.g. x=100 -> d=3 -> (d-1)=2
  --    then for n=2 => guess = 10^(2/2)=10^1=10, which is close to sqrt(100)=10.
  --    For n=3 => guess=10^(2/3)=10^(0)=1, etc.
  local exponent = math.floor((d - 1) / n_i)
  if exponent < 0 then exponent = 0 end -- don't go negative
  local guess = bint.ipow(bint.frominteger(10), exponent)
  if guess:iszero() then
    guess = bint.one()
  end

  -- 3) Perform integer Newton iteration:
  --    nextGuess = ((n-1)*g + floor(x / g^(n-1))) // n
  --    Usually converges in a handful of steps.
  local n_bint   = bint.frominteger(n_i)
  local n_minus1 = bint.frominteger(n_i - 1)
  while true do
    -- g^(n-1):
    local guessPow = bint.ipow(guess, n_i - 1)
    -- ratio = x // g^(n-1)
    local ratio    = x // guessPow
    -- next = ( (n-1)*g + ratio ) // n
    local nxt      = (n_minus1 * guess + ratio) // n_bint

    -- check for convergence
    if nxt == guess or nxt == guess + bint.one() then
      -- see if nxt overshoots
      local nxtPow = bint.ipow(nxt, n_i)
      if nxtPow:ule(x) then
        return nxt
      else
        return guess
      end
    end
    guess = nxt
  end
end

---Raise a bint to the power of RR
---
---@param base bint
---@return bint The exponentiation result
calc.bintExpRR              = function(base)
  local expNum, expDenom = calc.rrExponentFraction()

  local raised = bint.ipow(base, expNum)
  local rooted = calc.nthRootBintNewton(raised, expDenom)
  return rooted
end

---Raise a bint to the power of 1 / RR
---
---@param base bint
---@return bint The exponentiation result
calc.bintExpInvRR           = function(base)
  local expNum, expDenom = calc.invRRExponentFraction()

  local raised = bint.ipow(base, expNum)
  local rooted = calc.nthRootBintNewton(raised, expDenom)
  return rooted
end

---Raise a bint to the power of CurveN
---
---Use fact that n = 1/R - 1
---
---@param base bint
---@return bint The exponentiation result
calc.bintExpCurveN          = function(base)
  local expNum, expDenom = calc.curveNExponentFraction()

  local raised = bint.ipow(base, expNum)
  local rooted = calc.nthRootBintNewton(raised, expDenom)
  return rooted
end

-- =========================
-- migrating to botega: botega.lua

local botega                = {}

---Called once the curve target is hit
---A Botega amm is created and liquidity is provided such that
---CurveReserve is used entirely
---issued token amoount is chosen such that marginal AMM price is initially == CurvePrice
function botega.migration()
  -- CREATE POOL

  ao.send({
    Target = BOTEGA_FACTORY_PROCESS,
    Action = "Add-Pool",
    Tags = {
      ["Token-A"] = ISSUED_TOKEN_PROCESS,
      ["Token-B"] = QUOTE_TOKEN_PROCESS,
    }
  })

  local confirmation = Receive(function(m)
    return m.Tags.Action == 'Add-Pool-Confirmation'
        and m.Tags["From-Process"] == BOTEGA_FACTORY_PROCESS
  end)

  BotegaAmmProcess = confirmation.Tags["Pool-Id"]

  -- PROVIDE LIQUIDITY

  local curvePrice = calc.price(CurveSupply)
  -- use all accumulated reserve
  local quoteTokenQty = CurveReserve

  --[[
      marginalAmmPrice = quoteTokenQty / issuedTokenQty
      => issuedTokenQty = quoteTokenQty / marginalAmmPrice

      We want the new marginal amm price to be == (curvePrice)
          => issuedTokenQty = quoteTokenQty / (curvePrice)
      also, curvePrice includes 18 digits of precision scaling
  ]]
  local issuedTokenQty = bint.udiv(
    quoteTokenQty * calc.PRICE_PRECISION,
    curvePrice
  )
  assert(bint.ule(issuedTokenQty, AvailableForSupply),
    "Internal: Botega migration --- insufficient curve tokens to match accumulated reserve --- Have: " ..
    tostring(AvailableForSupply) .. " - Need: " .. tostring(issuedTokenQty))

  -- receive the LP tokens credit notice
  local lpTokensCreditNotice = botega.provideLiquidity(quoteTokenQty, issuedTokenQty) -- awaits the confirmation

  CurveReserve = CurveReserve - quoteTokenQty
  AvailableForSupply = AvailableForSupply - issuedTokenQty
  MigrationSupply = issuedTokenQty

  -- ! not updating CurveSupply since this is not necessarily adding to the circulating supply of the issued tokens
  -- it depends on how you want to define the issued token's official total supply

  -- BURN & COLLECT LIQUIDITY TOKENS

  botega.manageLPTokens(lpTokensCreditNotice)

  -- BURN THE REMAINING un-issued SUPPLY

  ao.send({
    Target = ISSUED_TOKEN_PROCESS,
    Action = "Transfer",
    Recipient = "0000000000000000000000000000000000000000000",
    Quantity = tostring(AvailableForSupply),
    ["X-Action"] = "Post-Botega-Migration-Burn"
  })

  -- WRAP UP

  IsMigrating = false
  HasMigrated = true
end

function botega.provideLiquidity(quoteTokenQty, issuedTokenQty)
  ao.send({
    Target = ISSUED_TOKEN_PROCESS,
    Action = "Transfer",
    Recipient = BotegaAmmProcess,
    Quantity = tostring(issuedTokenQty),
    ["X-Action"] = "Provide",
    ["X-Slippage-Tolerance"] = "0.5"
  })

  ao.send({
    Target = QUOTE_TOKEN_PROCESS,
    Action = "Transfer",
    Recipient = BotegaAmmProcess,
    Quantity = tostring(quoteTokenQty),
    ["X-Action"] = "Provide",
    ["X-Slippage-Tolerance"] = "0.5"
  })

  -- return the received the LP tokens credit notice
  return Receive(function(m)
    return m.Tags.Action == "Credit-Notice"
        and m.Tags["From-Process"] == BotegaAmmProcess
  end)
end

function botega.manageLPTokens(lpTokensCreditNotice)
  local lpTokensQty = bint(lpTokensCreditNotice.Tags.Quantity)

  local toBurn = bint.udiv(lpTokensQty * LP_TOKENS_TO_BURN, 10000)

  ao.send({
    Target = BotegaAmmProcess,
    Action = "Transfer",
    Recipient = BURNER_PROCESS,
    Quantity = tostring(toBurn)
  })

  local toKeep = lpTokensQty - toBurn

  ao.send({
    Target = BotegaAmmProcess,
    Action = "Transfer",
    Recipient = DEV_ACCOUNT,
    Quantity = tostring(toKeep)
  })
end

-- =========================
-- curve sells, buys, botega migration: curve.lua

local curve               = {}

-- json encoding of data
curve.sendReply           = function(msg, tags, data)
  msg.reply({
    Action = "Resp-" .. msg.Tags.Action,
    Tags = tags,
    Data = json.encode(data)
  })
end

-- no json encoding of data
curve.sendReplyRaw        = function(msg, tags, data)
  msg.reply({
    Action = "Resp-" .. msg.Tags.Action,
    Tags = tags,
    Data = data
  })
end

curve.handleInfo          = function(msg)
  local tags = {
    -- config
    ["Reserve-Token-Process"] = QUOTE_TOKEN_PROCESS,
    ["Reserve-Token-Denomination"] = tostring(QUOTE_TOKEN_DENOMINATION),
    ["Issued-Token-Process"] = ISSUED_TOKEN_PROCESS,
    ["Issued-Token-Denomination"] = tostring(ISSUED_TOKEN_DENOMINATION),

    ["Target-Curve-Supply"] = tostring(TargetSupply),
    ["Target-Curve-Reserve"] = tostring(TargetLiquidity),
    ["Target-Curve-Price"] = tostring(TargetPrice),
    ["Target-Curve-Market-Cap"] = tostring(TargetMarketCap),

    ["Curve-M"] = tostring(CurveM),
    ["Curve-RR"] = tostring(CurveRR),
    ["Curve-N"] = tostring(CurveN),

    ["Curve-Fee"] = tostring(CurveFee),

    ["Botega-Factory-Process"] = BOTEGA_FACTORY_PROCESS,
    ["Burner-Process"] = BURNER_PROCESS,
    ["Developer-Account"] = DEV_ACCOUNT,

    -- state
    ["Is-Initialized"] = tostring(IsInitialized),
    ["Curve-Supply"] = tostring(CurveSupply),
    ["Available-For-Supply"] = tostring(AvailableForSupply),

    ["Curve-Reserve"] = tostring(CurveReserve),

    ["Curve-Price"] = tostring(calc.price(CurveSupply)),

    ["Fees-Collected"] = tostring(FeesCollected),

    ["LP-Tokens-Burn-Ratio"] = tostring(LP_TOKENS_TO_BURN),
    ["Is-Migrating"] = tostring(IsMigrating),
    ["Has-Migrated"] = tostring(HasMigrated),
    ["Botega-AMM-Process"] = BotegaAmmProcess or nil,
    ["Migration-Supply"] = MigrationSupply and tostring(MigrationSupply) or nil,
  }
  return curve.sendReply(msg, tags, {})
end

curve.handleInitialize    = function(msg)
  if IsInitialized then
    return
  end

  local amount = msg.Tags["Quantity"]

  -- ... optional checks
  -- ensure that the received amount is the token's total supply
  -- ensure that the received amount is enough to :
  -- 1. reach curve target
  -- 2. provide enough liquidity on botega migration

  IsInitialized = true
  AvailableForSupply = bint(amount)
end

---Get the expected output for a BUY FROM THE CURVE
---output quantity (issued token) obtained for
---paying a given input quantity (quote token)
curve.handleGetBuyOutput  = function(msg)
  local reason = curve.checkCannotTrade()
  if reason then
    curve.sendReply(msg, { ["Error"] = reason }, "")
    return
  end

  local amount = msg.Tags["Quantity"]
  assert(amount, "'Quantity' is required")

  local inputQty = bint(amount)
  local netInputQty, feeTaken = calc.deductFee(inputQty)

  local outputQty = calc.getOutputForBuy(netInputQty)

  local newCurvePrice = calc.price(CurveSupply + outputQty)
  local effectiveTradePrice = calc.getEffectivePrice(inputQty, outputQty)
  local tags = {
    ["Output-Quantity"] = tostring(outputQty),
    ["Fee-Taken"] = tostring(feeTaken),
    ["New-Curve-Price"] = tostring(newCurvePrice),
    ["Effective-Trade-Price"] = tostring(effectiveTradePrice)
  }
  local data = {}
  curve.sendReply(msg, tags, data)
end

---BUY FROM THE CURVE
---Can only be performed after initialization and before migrating to botega
---Will partially refund if full paid amount leads to an overshooting
---of the reserve target / supply target
---If the buy leads to the curve target being reached, a migration to
---Botega is triggered
curve.handleBuyFromCurve  = function(msg)
  local refundReason = curve.checkCannotTrade()
  if refundReason then
    ao.send({
      Target = QUOTE_TOKEN_PROCESS,
      Action = "Transfer",
      Recipient = msg.Tags.Sender,
      Quantity = msg.Tags.Quantity,
      ["X-Refund-Reason"] = refundReason
    })
    return
  end

  local amount = msg.Tags["Quantity"]
  assert(amount, "'Quantity' is required")

  local inputQty = bint(amount)
  local netInputQty, feeTaken = calc.deductFee(inputQty)

  -- Ensure we don't overshoot the curve target for the Botega migration
  local missingReserve = TargetLiquidity - CurveReserve

  if netInputQty > missingReserve then
    -- split the inputQty
    -- we need to choose an input quantity so that
    -- netInputQty brings us above the target mp3Coin supply
    -- while remaining as close as possible to it
    -- adding 1 to account for precision loss in bigint arithmetic
    --    => we end up slightly above the target
    netInputQty = missingReserve + 1
    local toUseNow = calc.addFee(netInputQty)
    feeTaken = toUseNow - netInputQty
    local toRefund = inputQty - toUseNow

    ao.send({
      Target = QUOTE_TOKEN_PROCESS,
      Action = "Transfer",
      Recipient = msg.Tags.Sender,
      Quantity = tostring(toRefund),
      ["X-Refund-Reason"] = [[
              The bonding curve is reaching its target supply due to your buy.
              You are being partially refunded because only part of your input amount can be used at this point.
          ]]
    })
  end

  local outputQty = calc.getOutputForBuy(netInputQty)

  -- ensure that amounts are available (calculations are correct)
  assert(bint.ule(feeTaken, inputQty), "calculated buy fee exceeds buy input quantity")
  assert(bint.ule(outputQty, AvailableForSupply), "buy output exceeds available amount of token to be issued")

  CurveReserve = CurveReserve + netInputQty
  CurveSupply = CurveSupply + outputQty
  AvailableForSupply = AvailableForSupply - outputQty

  -- transfer fee out
  curve.sendTradingFees(feeTaken, msg.Id)

  -- pay buyer
  ao.send({
    Target = ISSUED_TOKEN_PROCESS,
    Action = "Transfer",
    Recipient = msg.Tags.Sender,
    Quantity = tostring(outputQty),
    ["X-Action"] = "Bonding-Curve-Buy-Output"
  })


  -- ... optionally record buy event

  -- check if we need to migration to Botega
  local hasReachedTarget = bint.ule(TargetLiquidity, CurveReserve)

  if hasReachedTarget then
    IsMigrating = true
    botega.migration()
  end
end

---Get the expected output for a SELL TO THE CURVE
---output quantity (quote token) obtained for
---paying a given input quantity (issued token)
curve.handleGetSellOutput = function(msg)
  local reason = curve.checkCannotTrade()
  if reason then
    curve.sendReply(msg, { ["Error"] = reason }, "")
    return
  end

  local amount = msg.Tags["Quantity"]
  assert(amount, "'Quantity' is required")

  local inputQty = bint(amount)
  local outputQty = calc.getOutputForSell(inputQty)

  local netOutputQty, feeTaken = calc.deductFee(outputQty)

  local newCurvePrice = calc.price(CurveSupply - outputQty)
  local effectiveTradePrice = calc.getEffectivePrice(inputQty, netOutputQty)
  local tags = {
    ["Output-Quantity"] = tostring(netOutputQty),
    ["Fee-Taken"] = tostring(feeTaken),
    ["New-Curve-Price"] = tostring(newCurvePrice),
    ["Effective-Trade-Price"] = tostring(effectiveTradePrice)
  }
  local data = {}
  curve.sendReply(msg, tags, data)
end

---SELL TO THE CURVE
---Can only be performed after initialization and before migrating to botega
curve.handleSellToCurve   = function(msg)
  local refundReason = curve.checkCannotTrade()
  if refundReason then
    ao.send({
      Target = ISSUED_TOKEN_PROCESS,
      Action = "Transfer",
      Recipient = msg.Tags.Sender,
      Quantity = msg.Tags.Quantity,
      ["X-Refund-Reason"] = refundReason
    })
    return
  end

  local amount = msg.Tags["Quantity"]
  assert(amount, "'Quantity' is required")

  local inputQty = bint(amount)
  local outputQty = calc.getOutputForSell(inputQty)

  local netOutputQty, feeTaken = calc.deductFee(outputQty)

  -- ensure that amounts are available (calculations are correct)
  assert(bint.ule(inputQty, CurveSupply), "sell input exceeds official curve supply in circulation")
  assert(bint.ule(outputQty, CurveReserve), "sell output exceeds available amount of token to be issued")
  assert(bint.ule(feeTaken, outputQty), "calculated sell fee exceeds sell output quantity")

  CurveReserve = CurveReserve - outputQty
  CurveSupply = CurveSupply - inputQty
  AvailableForSupply = AvailableForSupply + inputQty

  -- transfer fee out
  curve.sendTradingFees(feeTaken, msg.Id)

  -- pay seller
  ao.send({
    Target = QUOTE_TOKEN_PROCESS,
    Action = "Transfer",
    Recipient = msg.Tags.Sender,
    Quantity = tostring(netOutputQty),
    ["X-Action"] = "Bonding-Curve-Sell-Output"
  })

  -- ... optionally record sell event
end


---Send quote token quantity to dev account
---Can only be performed before migrating to botega
curve.sendTradingFees = function(qty, triggerId)
  FeesCollected = FeesCollected + qty
  ao.send({
    Target = QUOTE_TOKEN_PROCESS,
    Action = "Transfer",
    Recipient = DEV_ACCOUNT,
    Quantity = tostring(qty),
    ["Trigger-Message-Id"] = triggerId
  })
end

---Check if the curve is in a suitable state for trading (initialized, not migrating, not migrated)
---@return string | nil reason - A reason if the state is not suitable for trading, nil otherwise
curve.checkCannotTrade = function()
  if not IsInitialized then
    return
    'The bonding curve is not initialized yet. Initialize the curve by transferring to it all the token supply that it should manage (distribute + migrate to Botega)'
  elseif IsMigrating or HasMigrated then
    return 'The bonding curve is no longer accepting buys due to the target supply being reached.'
  end

  return nil
end

-- =========================
-- globals: main.lua

--[[
  ** Bonding Curve function

  This bonding curve is based on the power function:

      price = m * supply ^ n

  m and n can be configured and they determine the curve's shape.
  m and n are stored in CurveM and CurveN at inception

  The bonding curve manages 2 tokens:
  - ISSUED_TOKEN: the token being distributed, tracked as CurveSupply
  - QUOTE_TOKEN: the token being received in exchange, accumulated as CurveReserve

  ** Buys & Sells

  Buys from the curve: pay QUOTE_TOKEN -> receive ISSUED_TOKEN
  Sells to the curve: pay ISSUED_TOKEN -> receive QUOTE_TOKEN

  The Curve is initialized by receiving the total supply of ISSUED_TOKEN

  The Curve allows for sells/buys until a certain target is reached.
  Then it migrates to Botega.

  ** Curve Target & Derived Configuration

  The target is defined in terms of QUOTE_TOKEN to be accumulated as CurveReserve.
  This value is stored as TargetLiquidity and is configured at inception

  The curve derives its TargetSupply, TargetPrice and TargetMarketCap from the configured TargetLiquidity.

  ** Botega Migration

  When the target is reached, the curve stops accepting buys & sells.
  It creates a Botega AMM and provides its accumulated reserves as liquidity,
  while matching them with a corresponding amount of ISSUED_TOKEN.

  Developers can configure how the curve should manage the Botega LP tokens.
]]

-- qAR by default
QUOTE_TOKEN_PROCESS       = QUOTE_TOKEN_PROCESS or
    'NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8' -- TODO change to your custom quote token, like wAR, if necessary
ISSUED_TOKEN_PROCESS      = ISSUED_TOKEN_PROCESS or
    '###ISSUED_TOKEN_PROCESS###'                  -- TODO 18 denomination token
ISSUED_TOKEN_DENOMINATION = ISSUED_TOKEN_DENOMINATION or
    '###ISSUED_TOKEN_DENOMINATION###'
QUOTE_TOKEN_DENOMINATION  = 12 -- TODO adjust according to your custom quote token if necessary
ISSUED_TOKEN_TICKER       = ISSUED_TOKEN_TICKER or '###ISSUED_TOKEN_TICKER###'
QUOTE_TOKEN_TICKER        =
"qAR" -- TODO adjust according to your custom quote token if necessary

-- configure bonding curve

TargetMarketCap           = TargetMarketCap or bint('###TARGET_MARKET_CAP###') * bint.ipow(10, QUOTE_TOKEN_DENOMINATION)
TargetSupply              = TargetSupply or bint('###TARGET_SUPPLY###') * bint.ipow(10, ISSUED_TOKEN_DENOMINATION)
CurveRR                   = CurveRR or '###CURVE_RR###'
local derivedCfg          = calc.curveDerivedConfig()
CurveN                    = CurveN or derivedCfg.n
TargetLiquidity           = TargetLiquidity or derivedCfg.targetLiquidity
TargetPrice               = TargetPrice or derivedCfg.targetPrice
CurveM                    = CurveM or calc.scaleCurveM('###CURVE_M###')

IsInitialized             = IsInitialized or false
AvailableForSupply        = AvailableForSupply or bint(0)

CurveReserve              = CurveReserve or bint(0)       -- quote token: how much taken in via buys
CurveSupply               = CurveSupply or bint(0)        -- issued token: how much given out via sells

CurveFee                  = CurveFee or '###CURVE_FEE###' -- bps - represents a % of the qAR, on buys and sells
FeesCollected             = FeesCollected or bint(0)

LP_TOKENS_TO_BURN         = LP_TOKENS_TO_BURN or
    '###LP_TOKENS_TO_BURN###' -- bps - representa a % of the lp tokens obtained on botega migration

IsMigrating               = false
HasMigrated               = false
BotegaAmmProcess          = BotegaAmmProcess or nil
MigrationSupply           = MigrationSupply or nil

BOTEGA_FACTORY_PROCESS    = "3XBGLrygs11K63F_7mldWz4veNx6Llg6hI2yZs8LKHo"
BURNER_PROCESS            = 'tPaIyq3VcpUdrYorOyH90aUbRo4x1Cv2S9DW-chowog'
DEV_ACCOUNT               = '###DEV_ACCOUNT###'


-- HANDLERS
Handlers.add('info',
  Handlers.utils.hasMatchingTag('Action', 'Info'),
  curve.handleInfo
)

-- transfer curve tokens into curve
Handlers.add('initialize',
  function(msg)
    return Handlers.utils.hasMatchingTag('Action', 'Credit-Notice') and
        msg.Tags["From-Process"] == ISSUED_TOKEN_PROCESS and
        msg.Tags["X-Action"] == "Initialize"
  end,
  curve.handleInitialize
)

Handlers.add('getBuyOutput',
  Handlers.utils.hasMatchingTag('Action', 'Get-Buy-Output'),
  curve.handleGetBuyOutput
)


Handlers.add('getSellOutput',
  Handlers.utils.hasMatchingTag('Action', 'Get-Sell-Output'),
  curve.handleGetSellOutput
)

Handlers.add('buy',
  function(msg)
    return Handlers.utils.hasMatchingTag('Action', 'Credit-Notice') and
        msg.Tags["From-Process"] == QUOTE_TOKEN_PROCESS and
        msg.Tags["X-Action"] == "Curve-Buy"
  end,
  curve.handleBuyFromCurve
)

Handlers.add('sell',
  function(msg)
    return Handlers.utils.hasMatchingTag('Action', 'Credit-Notice') and
        msg.Tags["From-Process"] == ISSUED_TOKEN_PROCESS and
        msg.Tags["X-Action"] == "Curve-Sell"
  end,
  curve.handleSellToCurve
)
