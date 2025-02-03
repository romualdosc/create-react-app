import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';

// Revenue Stage enum equivalent
const RevenueStage = {
  PRE_REVENUE: { score: 0, description: "Pre-revenue" },
  EARLY_REVENUE: { score: 5, description: "Early revenue" },
  GROWING_REVENUE: { score: 10, description: "Growing revenue" }
};

// Calculator logic ported from Python
const calculateCategoryScore = (subcategories, maxPoints) => {
  const total = Object.values(subcategories).reduce((sum, score) => sum + score, 0);
  return Math.min(total, maxPoints);
};

const calculateFundingScore = (scores) => {
  const categoryScores = {
    market_product_fit: calculateCategoryScore({
      market_size: parseFloat(scores.marketSize) || 0,
      product_uniqueness: parseFloat(scores.productUniqueness) || 0,
      customer_validation: parseFloat(scores.customerValidation) || 0
    }, 30),
    financial_health: calculateCategoryScore({
      revenue_stage: parseFloat(scores.revenueStage) || 0,
      gross_margins: parseFloat(scores.grossMargins) || 0,
      financial_projections: parseFloat(scores.financialProjections) || 0
    }, 20),
    team_execution: calculateCategoryScore({
      founders_experience: parseFloat(scores.foundersExperience) || 0,
      team_composition: parseFloat(scores.teamComposition) || 0,
      execution_capability: parseFloat(scores.executionCapability) || 0
    }, 20),
    scalability_risk: calculateCategoryScore({
      scalability: parseFloat(scores.scalability) || 0,
      risks: parseFloat(scores.risks) || 0,
      industry_trends: parseFloat(scores.industryTrends) || 0
    }, 15),
    funding_readiness: calculateCategoryScore({
      funding_clarity: parseFloat(scores.fundingClarity) || 0,
      previous_investment: parseFloat(scores.previousInvestment) || 0,
      investor_fit: parseFloat(scores.investorFit) || 0
    }, 15)
  };

  const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
  return { totalScore, categoryScores };
};

// Score Arc Meter Component
// Custom Report Section Component
const ReportSection = ({ title, icon: Icon, isOpen: defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border rounded-lg mb-4 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${isOpen ? 'text-blue-500' : 'text-gray-500'}`} />
          <span className="font-semibold text-left">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t bg-white transition-all duration-300 ease-in-out">
          {children}
        </div>
      )}
    </div>
  );
};

// Custom Badge Component
const ScoreBadge = ({ score }) => {
  let color;
  let label;
  
  if (score >= 86) {
    color = "bg-blue-500";
    label = "Expansion";
  } else if (score >= 71) {
    color = "bg-green-500";
    label = "Growth";
  } else if (score >= 51) {
    color = "bg-yellow-500";
    label = "Seed";
  } else if (score >= 31) {
    color = "bg-orange-500";
    label = "Early";
  } else {
    color = "bg-red-500";
    label = "Not Ready";
  }

  return (
    <span className={`${color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
      {label}
    </span>
  );
};

const ScoreArcMeter = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(score);
  const centerX = 200;
  const centerY = 160;
  const radius = 150;
  const strokeWidth = 30;
  
  React.useEffect(() => {
    setAnimatedScore(score);
  }, [score]);

  const scoreRanges = [
    { range: [0, 30], color: "#EF4444", label: "Not Ready" },    
    { range: [31, 50], color: "#F97316", label: "Early" },       
    { range: [51, 70], color: "#EAB308", label: "Seed" },        
    { range: [71, 85], color: "#22C55E", label: "Growth" },      
    { range: [86, 100], color: "#3B82F6", label: "Expansion" }   
  ];

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const createArc = (startAngle, endAngle, color) => {
    const mappedStart = 270 + (startAngle / 100) * 180;
    const mappedEnd = 270 + (endAngle / 100) * 180;
    
    const start = polarToCartesian(centerX, centerY, radius, mappedEnd);
    const end = polarToCartesian(centerX, centerY, radius, mappedStart);
    const largeArcFlag = mappedEnd - mappedStart <= 180 ? "0" : "1";

    return {
      path: [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
      ].join(" "),
      color
    };
  };

  const getCurrentColor = (score) => {
    const range = scoreRanges.find(({ range }) => 
      score >= range[0] && score <= range[1]
    );
    return range ? range.color : scoreRanges[0].color;
  };

  const scoreArcs = scoreRanges.map(({ range, color }) => 
    createArc(range[0], range[1], color)
  );

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg viewBox="0 0 400 250" className="w-full">
        {scoreArcs.map((arc, index) => (
          <path
            key={index}
            d={arc.path}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            className="opacity-30"
          />
        ))}

        <path
          d={createArc(0, animatedScore, getCurrentColor(animatedScore)).path}
          fill="none"
          stroke={getCurrentColor(animatedScore)}
          strokeWidth={strokeWidth}
        />

        <circle
          cx={centerX}
          cy={centerY}
          r="45"
          fill="white"
          stroke={getCurrentColor(animatedScore)}
          strokeWidth="3"
        />

        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          className="font-bold text-4xl"
          fill={getCurrentColor(animatedScore)}
        >
          {Math.round(animatedScore)}
        </text>
      </svg>
    </div>
  );
};

// Main Component
const FundingScoreCalculator = () => {
  const [scores, setScores] = useState({
    marketSize: '',
    productUniqueness: '',
    customerValidation: '',
    revenueStage: '',
    grossMargins: '',
    financialProjections: '',
    foundersExperience: '',
    teamComposition: '',
    executionCapability: '',
    scalability: '',
    risks: '',
    industryTrends: '',
    fundingClarity: '',
    previousInvestment: '',
    investorFit: ''
  });

  const [calculatedScore, setCalculatedScore] = useState(null);

  const validateInput = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 10;
  };

  const handleInputChange = (field, value) => {
    setScores(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateScore = () => {
    const result = calculateFundingScore(scores);
    setCalculatedScore(result);
  };

  const renderScoreSection = (title, fields, maxScore) => (
    <div className="space-y-4 mb-6">
      <h3 className="font-semibold text-lg">{title} (Max: {maxScore} points)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map(([field, label]) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input
              id={field}
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={scores[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={!validateInput(scores[field]) && scores[field] !== '' ? 'border-red-500' : ''}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Startup Funding Score Calculator</CardTitle>
          <CardDescription>
            Enter scores from 0-10 for each category to calculate the overall funding score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderScoreSection('Market & Product Fit', [
            ['marketSize', 'Market Size'],
            ['productUniqueness', 'Product Uniqueness'],
            ['customerValidation', 'Customer Validation']
          ], 30)}

          {renderScoreSection('Financial Health', [
            ['revenueStage', 'Revenue Stage'],
            ['grossMargins', 'Gross Margins'],
            ['financialProjections', 'Financial Projections']
          ], 20)}

          {renderScoreSection('Team & Execution', [
            ['foundersExperience', 'Founders Experience'],
            ['teamComposition', 'Team Composition'],
            ['executionCapability', 'Execution Capability']
          ], 20)}

          {renderScoreSection('Scalability & Risk', [
            ['scalability', 'Scalability'],
            ['risks', 'Risks'],
            ['industryTrends', 'Industry Trends']
          ], 15)}

          {renderScoreSection('Funding Readiness', [
            ['fundingClarity', 'Funding Clarity'],
            ['previousInvestment', 'Previous Investment'],
            ['investorFit', 'Investor Fit']
          ], 15)}

          <Button 
            onClick={calculateScore}
            className="w-full"
            disabled={Object.values(scores).some(score => !validateInput(score))}
          >
            Calculate Score
          </Button>

          {calculatedScore && (
            <div className="mt-8 space-y-6">
              <ScoreArcMeter score={calculatedScore.totalScore} />
              
              {/* Comprehensive Report */}
              <div className="mt-8">
                <ReportSection title="Score Overview" icon={BarChart2} isOpen={true}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-5xl font-bold text-blue-600">
                      {Math.round(calculatedScore.totalScore)}
                    </div>
                    <ScoreBadge score={calculatedScore.totalScore} />
                    <p className="text-gray-600 text-center mt-2">
                      {calculatedScore.totalScore >= 86 ? "Ready for expansion funding. Focus on scaling operations and market expansion." :
                       calculatedScore.totalScore >= 71 ? "Strong growth potential. Consider Series A funding and team expansion." :
                       calculatedScore.totalScore >= 51 ? "Ready for seed funding. Focus on market validation and MVP refinement." :
                       calculatedScore.totalScore >= 31 ? "Early stage. Focus on product development and initial market testing." :
                       "Need to strengthen fundamentals before seeking funding."}
                    </p>
                  </div>
                </ReportSection>

                <ReportSection title="Category Analysis" icon={CheckCircle}>
                  <div className="space-y-4">
                    {Object.entries(calculatedScore.categoryScores).map(([category, score]) => (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium capitalize">{category.replace(/_/g, ' ')}</span>
                          <span className="text-sm text-gray-500">{score.toFixed(1)}/{
                            category.includes('market') ? '30' :
                            category.includes('financial') || category.includes('team') ? '20' : '15'
                          }</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                            style={{ width: `${(score / (
                              category.includes('market') ? 30 :
                              category.includes('financial') || category.includes('team') ? 20 : 15
                            )) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ReportSection>

                <ReportSection title="Key Recommendations" icon={AlertTriangle}>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <p className="text-sm">
                        <strong>Next Steps:</strong> {
                          calculatedScore.totalScore >= 86 ? "Focus on scaling operations and expanding market presence." :
                          calculatedScore.totalScore >= 71 ? "Prepare for Series A funding and strengthen growth metrics." :
                          calculatedScore.totalScore >= 51 ? "Validate market fit and refine your MVP." :
                          calculatedScore.totalScore >= 31 ? "Focus on product development and initial traction." :
                          "Build core fundamentals and strengthen your value proposition."
                        }
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <p className="text-sm">
                        <strong>Focus Areas:</strong> {
                          calculatedScore.totalScore < 50 ? "Build fundamental strengths and market validation." :
                          calculatedScore.totalScore < 70 ? "Scale operations and strengthen team." :
                          "Expand market presence and optimize growth metrics."
                        }
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                      <p className="text-sm">
                        <strong>Funding Strategy:</strong> {
                          calculatedScore.totalScore < 50 ? "Focus on angel investors and early-stage grants." :
                          calculatedScore.totalScore < 70 ? "Target seed funding and strategic investors." :
                          "Prepare for Series A and institutional investors."
                        }
                      </p>
                    </div>
                  </div>
                </ReportSection>

                <ReportSection title="Comparative Analysis" icon={BarChart2}>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Score Percentile</h4>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                            Your Score
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            {Math.round(calculatedScore.totalScore)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex h-2 overflow-hidden bg-gray-200 rounded">
                        <div
                          className="bg-blue-500 transition-all duration-300"
                          style={{ width: `${calculatedScore.totalScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Not Ready</span>
                        <span>Early</span>
                        <span>Seed</span>
                        <span>Growth</span>
                        <span>Expansion</span>
                      </div>
                    </div>
                  </div>
                </ReportSection>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FundingScoreCalculator;