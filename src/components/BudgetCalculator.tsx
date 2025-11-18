import { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface BudgetCalculatorProps {
  propertyPrice: number;
  deposit?: number;
  fees?: number;
  estimatedTransportCost?: number;
}

export default function BudgetCalculator({
  propertyPrice,
  deposit,
  fees,
  estimatedTransportCost,
}: BudgetCalculatorProps) {
  const [months, setMonths] = useState('6');
  const [electricityCost, setElectricityCost] = useState('15000');
  const [waterCost, setWaterCost] = useState('5000');
  const [transportCost, setTransportCost] = useState(
    (estimatedTransportCost || 60000).toString()
  );
  const [expanded, setExpanded] = useState(false);

  const calculations = useMemo(() => {
    const numMonths = parseInt(months) || 6;
    const monthlyRent = propertyPrice;
    const cautionAmount = deposit || monthlyRent * 2;
    const agencyFees = fees || 0;
    const monthlyElectricity = parseInt(electricityCost) || 15000;
    const monthlyWater = parseInt(waterCost) || 5000;
    const monthlyTransport = parseInt(transportCost) || 60000;

    const initialCosts = cautionAmount + agencyFees + monthlyRent;
    const monthlyRecurring = monthlyRent + monthlyElectricity + monthlyWater + monthlyTransport;
    const totalRent = monthlyRent * numMonths;
    const totalElectricity = monthlyElectricity * numMonths;
    const totalWater = monthlyWater * numMonths;
    const totalTransport = monthlyTransport * numMonths;
    const totalRecurring = monthlyRecurring * numMonths;
    const grandTotal = initialCosts + totalRecurring;

    return {
      numMonths,
      monthlyRent,
      cautionAmount,
      agencyFees,
      monthlyElectricity,
      monthlyWater,
      monthlyTransport,
      initialCosts,
      monthlyRecurring,
      totalRent,
      totalElectricity,
      totalWater,
      totalTransport,
      totalRecurring,
      grandTotal,
    };
  }, [months, propertyPrice, deposit, fees, electricityCost, waterCost, transportCost]);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-primary" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Calculateur de Budget</h3>
            <p className="text-sm text-gray-600">Estimez vos dépenses</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="p-6 space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée de location (mois)
              </label>
              <input
                type="number"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coût mensuel électricité (FCFA)
              </label>
              <input
                type="number"
                value={electricityCost}
                onChange={(e) => setElectricityCost(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coût mensuel eau (FCFA)
              </label>
              <input
                type="number"
                value={waterCost}
                onChange={(e) => setWaterCost(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coût mensuel transport (FCFA)
              </label>
              <input
                type="number"
                value={transportCost}
                onChange={(e) => setTransportCost(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Coûts initiaux */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">💸 Coûts Initiaux (à payer au début)</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Premier mois de loyer</span>
                <span className="font-semibold text-gray-900">{formatMoney(calculations.monthlyRent)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Caution</span>
                <span className="font-semibold text-amber-600">{formatMoney(calculations.cautionAmount)}</span>
              </div>
              {calculations.agencyFees > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Frais d'agence</span>
                  <span className="font-semibold text-gray-900">{formatMoney(calculations.agencyFees)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                <span className="font-semibold text-gray-900">Total à prévoir au départ</span>
                <span className="font-bold text-lg text-primary">{formatMoney(calculations.initialCosts)}</span>
              </div>
            </div>
          </div>

          {/* Coûts mensuels */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">📅 Coûts Mensuels Récurrents</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Loyer</span>
                <span className="font-semibold text-gray-900">{formatMoney(calculations.monthlyRent)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Électricité</span>
                <span className="font-semibold text-gray-900">{formatMoney(calculations.monthlyElectricity)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Eau</span>
                <span className="font-semibold text-gray-900">{formatMoney(calculations.monthlyWater)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Transport</span>
                <span className="font-semibold text-gray-900">{formatMoney(calculations.monthlyTransport)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                <span className="font-semibold text-gray-900">Total par mois</span>
                <span className="font-bold text-lg text-primary">{formatMoney(calculations.monthlyRecurring)}</span>
              </div>
            </div>
          </div>

          {/* Total général */}
          <div className="bg-primary/5 border-2 border-primary rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">Total sur {calculations.numMonths} mois</span>
              <span className="font-bold text-2xl text-primary">{formatMoney(calculations.grandTotal)}</span>
            </div>
          </div>

          {/* Note d'information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              💡 Ces estimations vous aident à planifier votre budget. Les coûts réels peuvent varier selon votre consommation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

