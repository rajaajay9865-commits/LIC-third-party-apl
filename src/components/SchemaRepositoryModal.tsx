import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Search, 
  ShieldAlert, 
  FileText, 
  Copy, 
  Check, 
  Download,
  AlertTriangle,
  Layers,
  Lock,
  Sparkles
} from 'lucide-react';

interface SchemaRepositoryModalProps {
  onClose: () => void;
}

interface SchemaField {
  columnName: string;
  dataType: string;
  category: 'Identifier' | 'Product' | 'Policy' | 'Financial' | 'Incident' | 'Temporal' | 'Specialized' | 'ML Target / Label';
  description: string;
  isSensitive?: boolean;
  notes?: string;
  exampleValue: string;
}

export const CLIENT_SCHEMA_FIELDS: SchemaField[] = [
  {
    columnName: 'record_key',
    dataType: 'string (UUID/Hash)',
    category: 'Identifier',
    description: 'Synthetic unique record key; not a real claim identifier.',
    exampleValue: 'REC-2026-9042-X1'
  },
  {
    columnName: 'product_category',
    dataType: 'enum (Health | Vehicle | Life | Property | Travel)',
    category: 'Product',
    description: 'Insurance product category: Health, Vehicle, Life, Property, Travel.',
    exampleValue: 'Vehicle'
  },
  {
    columnName: 'region',
    dataType: 'enum (North | South | East | West | Central)',
    category: 'Policy',
    description: 'Broad synthetic region category.',
    exampleValue: 'West'
  },
  {
    columnName: 'age',
    dataType: 'integer',
    category: 'Policy',
    description: 'Synthetic age in years.',
    exampleValue: '38'
  },
  {
    columnName: 'demographic_category',
    dataType: 'string',
    category: 'Policy',
    isSensitive: true,
    description: 'Synthetic demographic category; use cautiously and exclude from consequential decisions.',
    notes: 'Regulatory Constraint: Excluded from ML feature vector to prevent bias & ensure disparate impact compliance.',
    exampleValue: 'Cat_B'
  },
  {
    columnName: 'policy_tenure_months',
    dataType: 'integer',
    category: 'Policy',
    description: 'Months since policy start.',
    exampleValue: '14'
  },
  {
    columnName: 'annual_premium',
    dataType: 'decimal / currency (INR / USD)',
    category: 'Financial',
    description: 'Illustrative annual premium in INR / USD.',
    exampleValue: '₹34,500 ($420)'
  },
  {
    columnName: 'coverage_amount',
    dataType: 'decimal / currency (INR / USD)',
    category: 'Financial',
    description: 'Illustrative coverage amount in INR / USD.',
    exampleValue: '₹1,500,000 ($18,000)'
  },
  {
    columnName: 'claim_amount',
    dataType: 'decimal / currency (INR / USD)',
    category: 'Financial',
    description: 'Illustrative claimed amount in INR / USD.',
    exampleValue: '₹285,000 ($3,450)'
  },
  {
    columnName: 'prior_claims_3y',
    dataType: 'integer',
    category: 'Policy',
    description: 'Synthetic number of claims in prior 3 years.',
    exampleValue: '1'
  },
  {
    columnName: 'has_prior_claims',
    dataType: 'binary (0 | 1)',
    category: 'Policy',
    description: '1 if prior claim count > 0, else 0.',
    exampleValue: '1'
  },
  {
    columnName: 'incident_category',
    dataType: 'string',
    category: 'Incident',
    description: 'Synthetic incident category (Collision, Water Damage, Surgery, Theft, etc.).',
    exampleValue: 'Collision'
  },
  {
    columnName: 'severity_category',
    dataType: 'enum (Minor | Moderate | Major | Catastrophic)',
    category: 'Incident',
    description: 'Synthetic severity category.',
    exampleValue: 'Major'
  },
  {
    columnName: 'report_lag_days',
    dataType: 'integer',
    category: 'Temporal',
    description: 'Days between incident and report, synthetic.',
    exampleValue: '4'
  },
  {
    columnName: 'documentation_complete',
    dataType: 'binary (0 | 1)',
    category: 'Incident',
    description: '1 means documentation marked complete; 0 incomplete.',
    exampleValue: '1'
  },
  {
    columnName: 'fraud_flag_demo',
    dataType: 'binary / boolean',
    category: 'ML Target / Label',
    isSensitive: true,
    description: 'Artificially generated demonstration flag; NOT verified fraud and must not be used to accuse real person.',
    notes: 'Decision-support prototype only.',
    exampleValue: '0'
  },
  {
    columnName: 'policy_lapse_indicator',
    dataType: 'binary (0 | 1)',
    category: 'Policy',
    description: 'Synthetic indicator of policy lapse prior to loss event.',
    exampleValue: '0'
  },
  {
    columnName: 'policy_tenure_years',
    dataType: 'decimal',
    category: 'Policy',
    description: 'Policy tenure converted to years.',
    exampleValue: '1.17'
  },
  {
    columnName: 'incident_month',
    dataType: 'integer (1-12)',
    category: 'Temporal',
    description: 'Month number 1-12.',
    exampleValue: '8'
  },
  {
    columnName: 'submission_channel',
    dataType: 'enum (Online | Agent | Branch | Call Center)',
    category: 'Incident',
    description: 'Submission channel through which First Notice of Loss was received.',
    exampleValue: 'Online'
  },
  {
    columnName: 'vehicle_age',
    dataType: 'integer',
    category: 'Specialized',
    description: 'Vehicle age for vehicle policies; zero otherwise.',
    exampleValue: '3'
  },
  {
    columnName: 'hospital_stay_days',
    dataType: 'integer',
    category: 'Specialized',
    description: 'Hospital stay days for health policies; zero otherwise.',
    exampleValue: '0'
  },
  {
    columnName: 'damage_level',
    dataType: 'string',
    category: 'Specialized',
    description: 'Damage level for property policies; not applicable otherwise.',
    exampleValue: 'N/A'
  },
  {
    columnName: 'classification_label',
    dataType: 'enum (Flag_for_Review | Standard_Review)',
    category: 'ML Target / Label',
    description: 'Synthetic classification label: Flag_for_Review or Standard_Review. Decision-support demo only.',
    exampleValue: 'Standard_Review'
  },
  {
    columnName: 'workflow_status',
    dataType: 'string',
    category: 'ML Target / Label',
    description: 'Synthetic workflow status for dashboard demonstrations.',
    exampleValue: 'In_Review'
  }
];

export const SchemaRepositoryModal: React.FC<SchemaRepositoryModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  const categories = ['ALL', 'Identifier', 'Product', 'Policy', 'Financial', 'Incident', 'Temporal', 'Specialized', 'ML Target / Label'];

  const filteredFields = CLIENT_SCHEMA_FIELDS.filter((f) => {
    if (selectedCategory !== 'ALL' && f.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        f.columnName.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.dataType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopySchemaJSON = () => {
    const jsonStr = JSON.stringify(CLIENT_SCHEMA_FIELDS, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadDDL = () => {
    const ddl = `-- AegisClaim AI Client Enterprise Claims Data Dictionary
-- Total Fields: ${CLIENT_SCHEMA_FIELDS.length}
-- Architecture: Relational Ingestion & XGBoost/RandomForest Preprocessing

CREATE TABLE insurance_claims_cohort (
${CLIENT_SCHEMA_FIELDS.map(f => {
  let sqlType = 'VARCHAR(255)';
  if (f.dataType.startsWith('integer')) sqlType = 'INTEGER';
  else if (f.dataType.startsWith('decimal')) sqlType = 'NUMERIC(14,2)';
  else if (f.dataType.startsWith('binary')) sqlType = 'SMALLINT';
  return `  ${f.columnName.padEnd(26)} ${sqlType.padEnd(16)} -- ${f.description}`;
}).join(',\n')}
);
`;
    const blob = new Blob([ddl], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_claims_schema_ddl.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Enterprise Client Data Dictionary & Schema Repository
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  25 Attributes
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official client dataset dictionary specification with demographic governance and model input mappings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySchemaJSON}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition"
              title="Copy schema definition as JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownloadDDL}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
              title="Download SQL DDL Schema"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export SQL DDL</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Regulatory Governance Guardrail Banner */}
        <div className="bg-slate-950/90 px-6 py-3 border-b border-slate-800/80 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 leading-relaxed">
            <strong className="text-amber-300">Client Demographic Fairness Mandate:</strong> Field <code className="text-indigo-300 font-mono">demographic_category</code> is explicitly tagged: <em>"Synthetic demographic category; use cautiously and exclude from consequential decisions."</em> Both XGBoost and Random Forest models mathematically drop this column from feature importances, guaranteeing strict non-discriminatory algorithmic compliance.
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search column names, descriptions, or data types..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table List of Schema Fields */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-slate-900">
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Column Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Data Type</th>
                  <th className="py-3 px-4">Description & Usage Guidelines</th>
                  <th className="py-3 px-4 text-right">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredFields.map((field, index) => (
                  <tr key={field.columnName} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{field.columnName}</span>
                        {field.isSensitive && (
                          <span 
                            title="Sensitive Protected Attribute - Model Excluded" 
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800/80"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            Excluded
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-indigo-300 border border-slate-700">
                        {field.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                      {field.dataType}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div>{field.description}</div>
                      {field.notes && (
                        <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                          {field.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                      {field.exampleValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">Showing {filteredFields.length} of 25 Columns · Enterprise Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
