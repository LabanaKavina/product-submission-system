export interface ApiError {
  status: string;
  statusCode: number;
  message: string;
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
