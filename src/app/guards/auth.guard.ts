import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../services/local_storage/local-storage.service';
import jwtDecode from 'jwt-decode';
import { TokenModel } from '../models/token_model';

export const authGuard = () => {
  const localStorageService: LocalStorageService = inject(LocalStorageService);
  const router = inject(Router);

  // Check for token
  if (!localStorageService.getData('token')) {
    localStorageService.clearData();
    router.navigateByUrl('/login');
  }

  return true;
};
