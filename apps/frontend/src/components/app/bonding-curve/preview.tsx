import * as Plot from "@observablehq/plot";

import { useContext, useEffect, useMemo, useRef } from 'react';
import { BondingCurve, BondingCurveDerived } from '../../../types/index';
import { CreateBondingCurveContext } from '@/context/create-bonding-curve';
import { calcPrice, calcSupplyForCost, generatePriceRange, generateSupplyRange } from "@/lib/bonding-curve-calc";

const formatMark = (price: number) => {
  let suffix = "";
  if (price > 1e9) {
    price /= 1e9;
    suffix = "B";
  } else if (price > 1e6) {
    price /= 1e6;
    suffix = "M";
  } else if (price > 1e3) {
    price /= 1e3;
    suffix = "K";
  }

  return Plot.formatNumber("en-US")(price) + suffix;
}

export default function BondingCurvePreview() {

  const ctx = useContext(CreateBondingCurveContext);
  const curve: BondingCurve | undefined = ctx?.curve;
  const curveDerived: BondingCurveDerived | undefined = ctx?.curveDerived;

  const supplyRange = useMemo(() => curve ? generateSupplyRange(curve) : [], [curve])
  const priceRange = useMemo(() => curve && curveDerived ? generatePriceRange(curve, curveDerived, supplyRange) : [], [curve, curveDerived, supplyRange])

  const initialBuyInput = 1 
  const initialBuyInputAfterFees = ( curve?.curveFee ? (1 - curve.curveFee / 100) : 1 ) * initialBuyInput
  const initialSupply = useMemo(() => curveDerived ? calcSupplyForCost(curveDerived, initialBuyInputAfterFees) : 0, [curveDerived, initialBuyInputAfterFees])
  const initialPrice = useMemo(() => curve && curveDerived ? calcPrice(curve, curveDerived, initialSupply) : 0, [curve, curveDerived, initialSupply])

  // const initialReserve2 = 10 ** 12 * 0.99
  // const initialSupply2 = useMemo(() => curveDerived ? calcSupplyForCost(curveDerived, initialReserve2) : 0, [curveDerived, initialReserve2])
  // console.log('initialReserve2', initialReserve2)
  // console.log('initialSupply2', initialSupply2)
  // console.log('n, m', curveDerived?.curveN, curveDerived?.curveM)
  
  const targetSupply = curve?.targetSupply
  const targetPrice = curveDerived?.targetPrice

  const containerRef = useRef();

  useEffect(() => {
    const plot = Plot.plot({
      marks: [
        // Bonding Curve Line
        Plot.line(supplyRange.map((s, i) => ({supply: s, price: priceRange[i]})), {x: 'supply', y: 'price', stroke: 'gray'}),
        
        // Transaction Points
        Plot.dot(
          supplyRange.length > 0 ? 
          [
            {supply: initialSupply, price: initialPrice, label: 'First Buy'},
            {supply: targetSupply, price: targetPrice, label: 'Target'}
          ]: [], {x: 'supply', y: 'price', fill: 'red', stroke: 'red', r: 5}),
        
        // Annotations
        Plot.text(
          supplyRange.length > 0 ? 
          [
            {supply: initialSupply, price: initialPrice, label: `Example Buy\n${initialBuyInput} qAR -> ${initialSupply!.toFixed(4)} xCOIN\nFee: ${(initialBuyInput - initialBuyInputAfterFees).toFixed(2)} qAR\nPrice reached: ${initialPrice!.toFixed(4)}`},
            {supply: targetSupply, price: targetPrice, label: `Target\nSupply: ${targetSupply!.toFixed(2)}\nPrice: ${targetPrice!.toFixed(4)}`},
          ] : [], {x: 'supply', y: 'price', text: 'label', dy: -35, dx: -25, textAnchor: 'start', fill: '#c5b8ff', fontFamily: 'monospace'})
      ],
      x: {label: 'Token Supply (xCOIN)', tickFormat: formatMark},
      y: {label: 'Token Price (qAR)', tickFormat: formatMark},
      width: 770,
      height: 500,
      marginLeft: 100,
      marginBottom: 60,
      marginRight: 100,
      marginTop: 60,
      grid: true,
      style: {
        fontSize: '12px'
      }
    })
    if (containerRef.current) {
      {/* @ts-expect-error Seems to be a type definition issue, the plot displays correctly */}
      containerRef.current.append(plot);
  }
    return () => plot.remove();
  }, [containerRef, supplyRange, priceRange, initialSupply, initialPrice, targetSupply, targetPrice]);

  return (
    <fieldset className="rounded-lg border p-6">
      <legend className="-ml-1 px-1 text-lg font-bold">Preview</legend>
      {/* @ts-expect-error Seems to be a type definition issue, the plot displays correctly */}
      <div ref={containerRef} />
    </fieldset>
  );
}
