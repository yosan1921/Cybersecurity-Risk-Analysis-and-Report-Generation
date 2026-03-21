import "next-auth";
import { UserRole } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      name?: string;
      mfaEnabled?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
    mfaEnabled?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    mfaEnabled?: boolean;
  }
}
