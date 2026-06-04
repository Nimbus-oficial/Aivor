export interface CreateUserDto {
  externalAuthSubject?: string | null;
  displayName?: string | null;
  email?: string | null;
  locale?: string;
}

export interface AddWalletDto {
  userId: string;
  address: string;
  chainId: number;
  label?: string | null;
  isPrimary?: boolean;
}
