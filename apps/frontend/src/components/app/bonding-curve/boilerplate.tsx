import { useContext } from 'react';
import { BondingCurve, BondingCurveDerived } from '../../../types/index';
import { CreateBondingCurveContext } from '@/context/create-bonding-curve';
import SyntaxHighlighter from 'react-syntax-highlighter';
import prism from "react-syntax-highlighter/dist/esm/styles/prism/duotone-dark";
import { BONDING_CURVE_BLUEPRINT } from './bonding-curve-blueprint';
import CopyButton from '@/components/cryptoui/copy-button';

const generateBoilerplate = (curve: BondingCurve, curveDerived: BondingCurveDerived) => {
  let template = BONDING_CURVE_BLUEPRINT
  template = template.replace(`'###TARGET_MARKET_CAP###'`, `"${curve.targetMCap!.toString()}"`)
  template = template.replace(`'###TARGET_SUPPLY###'`, `"${curve.targetSupply!.toString()}"`)
  template = template.replace(`'###CURVE_M###'`, `${curveDerived.curveM!.toString()}`)
  template = template.replace(`'###CURVE_RR###'`, `${curve.curveRR!.toString()}`)
  template = template.replace(`'###CURVE_FEE###'`, `${(Math.floor(curve.curveFee! * 100)).toString()}`)
  template = template.replace(`'###ISSUED_TOKEN_PROCESS###'`, `"${curve.supplyToken}"`)
  template = template.replace(`'###ISSUED_TOKEN_DENOMINATION###'`, `${curve.supplyTokenDenomination}`)
  template = template.replace(`'###ISSUED_TOKEN_TICKER###'`, `"${curve.supplyTokenTicker}"`)
  template = template.replace(`'###DEV_ACCOUNT###'`, `"${curve.devAccount}"`)
  template = template.replace(`'###LP_TOKENS_TO_BURN###'`, `${Math.floor(curve.lpTokensToBurn! * 100).toString()}`)

  return template;
}

export default function Boilerplate() {

  const ctx = useContext(CreateBondingCurveContext);
  const curveForCode: BondingCurve | undefined = ctx?.curveForCode;
  const curveDerivedForCode: BondingCurveDerived | undefined = ctx?.curveDerivedForCode;

  const boilerplate = (curveForCode && curveDerivedForCode) ? generateBoilerplate(curveForCode, curveDerivedForCode) : "";

  if (boilerplate === "") return null;

  return (
    <div className="">
      <fieldset className="relative rounded-lg border px-4 mt-4">
        <legend className="-ml-1 px-1 text-lg font-bold">Bonding Curve Code</legend>
          <div className="absolute right-0 top-0 px-8 py-6">
            <CopyButton value={boilerplate} size={5}/>
          </div>
          <SyntaxHighlighter
            language="lua"
            style={{ ...prism }}
            wrapLongLines={true}
          >
            {boilerplate}
          </SyntaxHighlighter>
      </fieldset>
    </div>
  );
}
