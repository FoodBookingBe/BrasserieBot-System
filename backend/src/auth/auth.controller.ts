import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '@prisma/client'; // Assuming User model from Prisma

// Define a type for the user payload attached by guards
interface UserPayload {
  id: number;
  email: string;
  role: string; // Adjust based on actual payload structure
}

// Define expected return types (adjust based on AuthService implementation)
interface LoginResponse {
  access_token: string;
}

// Use Omit to exclude password from the profile response
type UserProfile = Omit<User, 'password'>;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: { email: string; password: string; firstName?: string; lastName?: string },
  ): Promise<UserProfile> { // Assuming register returns the created user profile
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  // Type the request object and its user property
  async login(@Request() req: { user: UserPayload }): Promise<LoginResponse> { 
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  // Type the request object and its user property
  async getProfile(@Request() req: { user: UserPayload }): Promise<UserProfile | null> { 
    // Pass the user ID (which is a number)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.authService.getUserProfile(req.user.id);
  }
}
