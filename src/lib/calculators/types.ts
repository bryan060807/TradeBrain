export type CalculatorResult = {
  calculatorKey: string;
  calculatorVersion: string;
  input: Record<string, unknown>;
  normalizedInput: Record<string, unknown>;
  result: Record<string, unknown>;
  formulaSteps: Array<{
    label: string;
    expression?: string;
    value: string | number;
    unit?: string;
  }>;
  warnings: Array<{
    severity: 'info' | 'warning' | 'critical';
    code: string;
    message: string;
  }>;
  assumptions: Array<{
    key: string;
    label: string;
    value: string | number | boolean;
    source: 'user' | 'profile_default' | 'project_default' | 'company_standard' | 'system_default';
  }>;
};
