const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

const TOKEN_KEY = 'trade_in_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetchFormData<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Do NOT set Content-Type — browser sets it with multipart boundary
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function login(
  email: string,
  password: string,
): Promise<import('./auth-types').LoginResponse> {
  return apiFetch('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// --- Customer API ---
export async function searchCustomers(query: string) {
  return apiFetch<{ data: Customer[]; total: number }>(
    `/v1/admin/customers?search=${encodeURIComponent(query)}`,
  );
}

export async function createCustomer(data: {
  name: string;
  phone: string;
  email?: string;
}) {
  return apiFetch<Customer>('/v1/admin/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Product Model API ---
export async function searchProductModels(query: string, category?: string) {
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  if (category) params.set('category', category);
  return apiFetch<{ data: ProductModel[]; total: number }>(
    `/v1/admin/product-models?${params.toString()}`,
  );
}

export async function createProductModel(data: {
  brand: string;
  name: string;
  category: string;
  basePrice: number;
}) {
  return apiFetch<ProductModel>('/v1/admin/product-models', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProductModel(
  id: string,
  data: Partial<{ brand: string; name: string; category: string; basePrice: number; isActive: boolean }>,
) {
  return apiFetch<ProductModel>(`/v1/admin/product-models/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// --- Test Guide API ---
export async function getTestGuides(category?: string) {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch<{ data: TestGuide[] }>(`/v1/admin/test-guides${params}`);
}

export async function createTestGuide(data: {
  category: string;
  name: string;
  steps: { stepNumber: number; title: string; description?: string }[];
}) {
  return apiFetch<TestGuide>('/v1/admin/test-guides', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTestGuide(
  id: string,
  data: Partial<{ category: string; name: string; steps: { stepNumber: number; title: string; description?: string }[] }>,
) {
  return apiFetch<TestGuide>(`/v1/admin/test-guides/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// --- Defect Checklist API ---
export async function getDefectChecklists(category?: string) {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch<{ data: DefectChecklist[] }>(`/v1/admin/defect-checklists${params}`);
}

export async function createDefectChecklist(data: {
  category: string;
  name: string;
  items: { name: string; description?: string; defaultSeverity?: number }[];
}) {
  return apiFetch<DefectChecklist>('/v1/admin/defect-checklists', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDefectChecklist(
  id: string,
  data: Partial<{ category: string; name: string; items: { name: string; description?: string; defaultSeverity?: number }[] }>,
) {
  return apiFetch<DefectChecklist>(`/v1/admin/defect-checklists/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// --- Assessment API ---
export async function createAssessment(data: {
  customerId: string;
  productModelId: string;
}) {
  return apiFetch<Assessment>('/v1/admin/assessments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAssessment(id: string) {
  return apiFetch<Assessment>(`/v1/admin/assessments/${id}`);
}

export async function submitTestResults(
  id: string,
  results: { testStepId: string; passed: boolean; notes?: string }[],
) {
  return apiFetch<Assessment>(`/v1/admin/assessments/${id}/test-results`, {
    method: 'PATCH',
    body: JSON.stringify({ results }),
  });
}

export async function uploadPhotos(id: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));
  return apiFetchFormData<AssessmentPhoto[]>(
    `/v1/admin/assessments/${id}/photos`,
    formData,
  );
}

export async function generateQRSession(id: string) {
  return apiFetch<QRSession>(`/v1/admin/assessments/${id}/qr-session`, {
    method: 'POST',
  });
}

export async function submitDefects(
  id: string,
  defects: { defectItemId: string; severity: number; notes?: string }[],
) {
  return apiFetch<Assessment>(`/v1/admin/assessments/${id}/defects`, {
    method: 'PATCH',
    body: JSON.stringify({ defects }),
  });
}

export async function addToStock(id: string) {
  return apiFetch<StockItem>(`/v1/admin/assessments/${id}/stock`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

// --- Pricing Rule API ---
export async function getPricingRules() {
  return apiFetch<{ data: PricingRule[] }>('/v1/admin/pricing-rules');
}

export async function createPricingRule(data: {
  name: string;
  category?: string;
  conditionType: string;
  conditionOperator: string;
  conditionValue: number;
  adjustmentType: string;
  adjustmentValue: number;
  priority: number;
}) {
  return apiFetch<PricingRule>('/v1/admin/pricing-rules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePricingRule(
  id: string,
  data: Partial<{
    name: string;
    category: string;
    conditionType: string;
    conditionOperator: string;
    conditionValue: number;
    adjustmentType: string;
    adjustmentValue: number;
    priority: number;
  }>,
) {
  return apiFetch<PricingRule>(`/v1/admin/pricing-rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deactivatePricingRule(id: string) {
  return apiFetch<PricingRule>(`/v1/admin/pricing-rules/${id}`, {
    method: 'DELETE',
  });
}

// --- Stock API ---
export async function getStockItems(filters: {
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: string;
  priceMax?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.status) params.set('status', filters.status);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.priceMin) params.set('priceMin', filters.priceMin);
  if (filters.priceMax) params.set('priceMax', filters.priceMax);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  return apiFetch<{ data: StockItemWithModel[]; total: number; page: number; pageSize: number }>(
    `/v1/admin/stock?${params.toString()}`,
  );
}

export async function getStockItemDetail(id: string) {
  return apiFetch<StockItemDetail>(`/v1/admin/stock/${id}`);
}

// --- Dashboard API ---
export async function getDashboardMetrics(dateFrom?: string, dateTo?: string) {
  const params = new URLSearchParams();
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);
  return apiFetch<DashboardMetrics>(`/v1/admin/dashboard?${params.toString()}`);
}

// --- Export API ---
export async function downloadExcel(path: string, filename: string) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status, 'Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- QR Mobile Photo API (no JWT) ---
export async function uploadMobilePhoto(sessionId: string, file: File) {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await fetch(`${BASE_URL}/v1/admin/qr-sessions/${sessionId}/photos`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? 'Upload failed');
  }
  return res.json() as Promise<AssessmentPhoto>;
}

// --- Seller API ---

const SELLER_TOKEN_KEY = 'trade_in_seller_token';

export function getSellerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SELLER_TOKEN_KEY);
}

export function setSellerToken(token: string): void {
  localStorage.setItem(SELLER_TOKEN_KEY, token);
}

export function removeSellerToken(): void {
  localStorage.removeItem(SELLER_TOKEN_KEY);
}

export async function sellerLogin(
  email: string,
  password: string,
): Promise<{ accessToken: string; user: { id: string; email: string; name: string; role: string } }> {
  return apiFetch('/v1/seller/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function sellerRegister(
  email: string,
  password: string,
  name: string,
): Promise<{ id: string; email: string; name: string }> {
  return apiFetch('/v1/seller/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function sellerSearchModels(query?: string) {
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  return apiFetch<{ data: ProductModel[] }>(
    `/v1/seller/product-models?${params.toString()}`,
  );
}

export async function sellerPriceCheck(
  productModelId: string,
  defects: { defectItemId: string; severity: number }[],
): Promise<PriceCheckResult> {
  return apiFetch('/v1/seller/price-check', {
    method: 'POST',
    body: JSON.stringify({ productModelId, defects }),
  });
}

// --- Types ---
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  createdAt: string;
}

export interface ProductModel {
  id: string;
  brand: string;
  name: string;
  category: string;
  basePrice: number;
  isActive: boolean;
}

export interface TestGuide {
  id: string;
  category: string;
  name: string;
  steps: TestStep[];
}

export interface TestStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string | null;
}

export interface DefectChecklist {
  id: string;
  category: string;
  name: string;
  items: DefectItem[];
}

export interface DefectItem {
  id: string;
  name: string;
  description?: string | null;
  defaultSeverity?: number | null;
}

export interface Assessment {
  id: string;
  status: string;
  customerId: string;
  productModelId: string;
  customer?: Customer;
  productModel?: ProductModel;
  testResults?: TestResult[];
  photos?: AssessmentPhoto[];
  defects?: AssessmentDefect[];
  basePrice?: number | null;
  testDeduction?: number | null;
  defectDeduction?: number | null;
  finalPrice?: number | null;
  createdAt: string;
}

export interface TestResult {
  id: string;
  testStepId: string;
  passed: boolean;
  notes?: string | null;
}

export interface AssessmentPhoto {
  id: string;
  url: string;
  uploadedVia: string;
  createdAt: string;
}

export interface AssessmentDefect {
  id: string;
  defectItemId: string;
  severity: number;
  notes?: string | null;
}

export interface QRSession {
  sessionId: string;
  qrCodeDataUrl: string;
  expiresAt: string;
}

export interface StockItem {
  id: string;
  assessmentId: string;
  status: string;
  conditionGrade: string;
  price: number;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  name: string;
  category?: string | null;
  conditionType: string;
  conditionOperator: string;
  conditionValue: number;
  adjustmentType: string;
  adjustmentValue: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


// --- Extended Stock Types ---
export interface StockItemWithModel extends StockItem {
  productModel?: ProductModel;
  assessment?: { id: string; customerId: string; customer?: Customer };
}

export interface StockItemDetail extends StockItem {
  assessment?: Assessment & {
    customer?: Customer;
    productModel?: ProductModel;
    testResults?: TestResult[];
    photos?: AssessmentPhoto[];
    defects?: AssessmentDefect[];
  };
  productModel?: ProductModel;
}

// --- Dashboard Types ---
export interface DashboardMetrics {
  assessedToday: number;
  totalStock: number;
  stockValue: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  customerName: string;
  productName: string;
  status: string;
  createdAt: string;
}


// --- Buyer API (public, no auth) ---
export async function browseProducts(
  category?: string,
  page?: number,
  pageSize?: number,
): Promise<{ data: BuyerProduct[]; total: number; page: number; pageSize: number }> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (page) params.set('page', String(page));
  if (pageSize) params.set('pageSize', String(pageSize));
  return apiFetch(`/v1/buyer/products?${params.toString()}`);
}

export async function getProductDetail(
  id: string,
): Promise<BuyerProductDetail> {
  return apiFetch(`/v1/buyer/products/${id}`);
}

// --- Buyer Types ---
export interface BuyerProduct {
  id: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  conditionGrade: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface BuyerProductDetail {
  id: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  conditionGrade: string;
  photos: { id: string; url: string }[];
  testSummary: { passed: number; failed: number };
  defectSummary: { count: number; averageSeverity: number };
  createdAt: string;
}

// --- Seller Types ---
export interface PriceCheckResult {
  estimatedMin: number;
  estimatedMax: number;
  basePrice: number;
  deductions: number;
  finalEstimate: number;
}
