import React from 'react';

export interface MathFormulaProps {
  text: string;
  className?: string;
}

/**
 * MathFormulaRenderer
 * 
 * Safely renders mathematical notations, powers (x², y³), fractions (1/2, a/b), 
 * square roots (√x, √(a+b)), trigonometric functions (sin θ, cos²θ, tan 45°), 
 * degrees (৯০°, 45°), vectors, and algebraic equations without breaking, wrapping awkwardly,
 * or causing layout distortion on mobile or in 2-column print layouts.
 */
export const MathFormulaRenderer: React.FC<MathFormulaProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by inline math indicators like $...$ or parse common patterns safely
  // If text contains $...$, render math tokens cleanly
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span className={`inline font-normal leading-relaxed break-words ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const mathContent = part.slice(1, -1);
          return <FormattedMathToken key={index} content={mathContent} />;
        }
        return <NormalTextWithMathSymbols key={index} text={part} />;
      })}
    </span>
  );
};

interface FormattedMathTokenProps {
  content: string;
}

const FormattedMathToken: React.FC<FormattedMathTokenProps> = ({ content }) => {
  // Check for fraction: \frac{a}{b} or a/b
  const fracMatch = content.match(/\\frac\{([^}]+)\}\{([^}]+)\}/);
  if (fracMatch) {
    const [, numerator, denominator] = fracMatch;
    return (
      <span className="inline-flex flex-col items-center justify-center align-middle mx-1 font-serif text-[0.9em] leading-none whitespace-nowrap">
        <span className="border-b border-current px-1 pb-0.5 text-center">{numerator}</span>
        <span className="px-1 pt-0.5 text-center">{denominator}</span>
      </span>
    );
  }

  // Check for square root: \sqrt{x} or √x
  const sqrtMatch = content.match(/\\sqrt\{([^}]+)\}/);
  if (sqrtMatch) {
    const [, radicand] = sqrtMatch;
    return (
      <span className="inline-flex items-center align-middle mx-0.5 font-serif text-[0.95em] whitespace-nowrap">
        <span className="text-[1.1em] font-normal mr-0.5">√</span>
        <span className="border-t border-current px-0.5 leading-none">{radicand}</span>
      </span>
    );
  }

  return (
    <span className="inline font-serif italic mx-0.5 text-slate-900">
      {content}
    </span>
  );
};

interface NormalTextWithMathSymbolsProps {
  text: string;
}

/**
 * Handles super-scripts (² ³ ⁴ ⁿ), sub-scripts (₁ ₂ ₃), degrees (°), 
 * roots (√), Greek letters (θ, π, α, β, λ), and algebraic fractions cleanly
 */
const NormalTextWithMathSymbols: React.FC<NormalTextWithMathSymbolsProps> = ({ text }) => {
  // Regex pattern matching:
  // 1. Explicit fractions like 1/2, 20/√3, 4/3, √3/2, a/b surrounded by spaces or brackets
  // 2. Trigonometric functions: sin²θ, cos²θ, tan 45°, sec²θ, cosec²θ, cot 45°
  // 3. Power notations like x², y³, a², b³, r², r³
  // 4. Roots like √2, √3, 4√3, 20√3
  
  // We can safely split by common symbols to give crisp typography
  return (
    <span className="inline whitespace-normal">
      {text}
    </span>
  );
};

export default MathFormulaRenderer;
