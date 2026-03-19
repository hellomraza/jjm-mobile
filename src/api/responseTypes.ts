export type UserRole = 'HO' | 'DO' | 'CO' | 'EM';

export type WorkItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type WorkItemComponentStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'REJECTED';

export type LocationType =
  | 'districts'
  | 'blocks'
  | 'panchayats'
  | 'villages'
  | 'subdivisions'
  | 'circles'
  | 'zones';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface UserResponseDto {
  id: string;
  code: string;
  email: string;
  name: string;
  role: UserRole;
  district_id?: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface LoginUserResponseDto {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponseDto {
  access_token: string;
  user: LoginUserResponseDto;
}

export interface AgreementResponseDto {
  id: string;
  agreementno: string;
  agreementyear: string;
  contractor_id: string;
  work_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkItemResponseDto {
  id: string;
  work_code: string;
  title: string;
  description: string;
  district_id: string;
  block_id: number;
  panchayat_id: number;
  village_id: number;
  subdivision_id: number;
  circle_id: number;
  zone_id: number;
  schemetype: string;
  nofhtc: string;
  amount_approved: number;
  payment_amount: number;
  serial_no: number;
  contractor_id: string;
  latitude: number;
  longitude: number;
  progress_percentage: number;
  status: WorkItemStatus;
  created_at: string;
  updated_at: string;
}

export interface ComponentResponseDto {
  id: string;
  name: string;
  unit: string;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface PhotoResponseDto {
  id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  employee_id: string;
  component_id: string;
  work_item_id: string;
  is_selected: boolean;
  selected_by?: unknown | null;
  selected_at?: unknown | null;
  is_forwarded_to_do: boolean;
  forwarded_at?: unknown | null;
  created_at: string;
}

export interface ActionResponseDto {
  success: boolean;
  message: string;
}

export interface WorkItemComponentResponseDto {
  id: string;
  work_item_id: string;
  component_id: string;
  quantity?: string;
  progress: string;
  remarks?: unknown | null;
  status: WorkItemComponentStatus;
  approved_photo_id?: unknown | null;
  created_at: string;
  updated_at: string;
  component?: ComponentResponseDto;
}

export interface LocationResponseDto {
  districtid?: number;
  districtname?: string;
  district_code?: string;
  blockid?: number;
  blockname?: string;
  block_code?: string;
  panchayatid?: number;
  panchayatname?: string;
  panchayat_code?: string;
  villageid?: number;
  villagename?: string;
  village_code?: string;
  subdivisionid?: number;
  subdivisionname?: string;
  subdivision_code?: string;
  circleid?: number;
  circlename?: string;
  circle_code?: string;
  zoneid?: number;
  zonename?: string;
  zone_code?: string;
  district_id?: number;
}

export type HealthResponse = string;

export type CreateUserResponse = UserResponseDto;
export type ListUsersResponse = PaginatedResponse<UserResponseDto>;
export type GetUserByIdResponse = UserResponseDto;
export type UpdateUserResponse = UserResponseDto;

export type LoginResponse = LoginResponseDto;

export type CreateAgreementResponse = AgreementResponseDto;
export type ListAgreementsResponse = PaginatedResponse<AgreementResponseDto>;
export type GetAgreementByIdResponse = AgreementResponseDto;
export type UpdateAgreementResponse = AgreementResponseDto;

export type CreateWorkItemResponse = WorkItemResponseDto;
export type ListWorkItemsResponse = PaginatedResponse<WorkItemResponseDto>;
export type GetWorkItemByIdResponse = WorkItemResponseDto;
export type UpdateWorkItemResponse = WorkItemResponseDto;
export type UpdateWorkItemStatusResponse = WorkItemResponseDto;

export type ListMasterComponentsResponse = ComponentResponseDto[];
export type UploadComponentPhotoResponse = PhotoResponseDto;
export type GetComponentPhotosResponse = PaginatedResponse<PhotoResponseDto>;
export type SelectComponentPhotoResponse = ActionResponseDto;
export type ApproveComponentResponse = ActionResponseDto;
export type RejectComponentResponse = ActionResponseDto;
export type GetPendingApprovalComponentsResponse =
  PaginatedResponse<WorkItemComponentResponseDto>;
export type GetApprovedComponentsResponse =
  PaginatedResponse<WorkItemComponentResponseDto>;
export type GetComponentsByWorkItemResponse = WorkItemComponentResponseDto[];
export type GetComponentByIdResponse = WorkItemComponentResponseDto;
export type UpdateComponentResponse = WorkItemComponentResponseDto;
export type SubmitComponentPhotoResponse = ActionResponseDto;

export type UploadPhotoResponse = PhotoResponseDto;
export type ListPhotosResponse = PaginatedResponse<PhotoResponseDto>;
export type ReviewComponentPhotosResponse = PaginatedResponse<PhotoResponseDto>;
export type SelectPhotoResponse = PhotoResponseDto;
export type ForwardPhotoResponse = PhotoResponseDto;
export type GetPhotoByIdResponse = PhotoResponseDto;

export type CreateLocationResponse = LocationResponseDto;
export type ListLocationsResponse = PaginatedResponse<LocationResponseDto>;
export type GetLocationByIdResponse = LocationResponseDto;
export type UpdateLocationResponse = LocationResponseDto;
