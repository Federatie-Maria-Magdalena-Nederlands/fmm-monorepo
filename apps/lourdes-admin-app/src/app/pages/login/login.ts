import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  public loginForm: FormGroup;
  public isLoading = false;
  public errorMessage = '';
  public showPassword = false;
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Redirect to dashboard if already authenticated
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  public isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  public async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const { email, password } = this.loginForm.value;
      
      // Sign in with Firebase Authentication
      await this.authService.signIn(email, password);
      
      // Navigate to dashboard after successful login
      this.router.navigate(['/dashboard']);
      
      this.isLoading = false;
    } catch (error: any) {
      console.error('Login error:', error);
      this.errorMessage = error.message || 'Invalid email or password. Please try again.';
      this.isLoading = false;
    }
  }
}
