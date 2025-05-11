// E-posta formatı kontrolü
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Şifre güçlülük kontrolü
export const isStrongPassword = (password: string): { isValid: boolean; message: string } => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      isValid: false,
      message: 'Şifre en az 8 karakter uzunluğunda olmalıdır.'
    };
  }

  if (!hasUpperCase) {
    return {
      isValid: false,
      message: 'Şifre en az bir büyük harf içermelidir.'
    };
  }

  if (!hasLowerCase) {
    return {
      isValid: false,
      message: 'Şifre en az bir küçük harf içermelidir.'
    };
  }

  if (!hasNumbers) {
    return {
      isValid: false,
      message: 'Şifre en az bir rakam içermelidir.'
    };
  }

  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: 'Şifre en az bir özel karakter içermelidir (!@#$%^&*(),.?":{}|<>).'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

// Ad soyad kontrolü
export const isValidName = (name: string): { isValid: boolean; message: string } => {
  const minLength = 2;
  const maxLength = 50;
  const hasValidChars = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(name);
  const hasOnlySpaces = /^\s*$/.test(name);

  if (hasOnlySpaces) {
    return {
      isValid: false,
      message: 'Ad soyad boş olamaz.'
    };
  }

  if (name.length < minLength) {
    return {
      isValid: false,
      message: 'Ad soyad en az 2 karakter uzunluğunda olmalıdır.'
    };
  }

  if (name.length > maxLength) {
    return {
      isValid: false,
      message: 'Ad soyad 50 karakterden uzun olamaz.'
    };
  }

  if (!hasValidChars) {
    return {
      isValid: false,
      message: 'Ad soyad sadece harf ve boşluk içerebilir.'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

// Doğrulama kodu kontrolü
export const isValidVerificationCode = (code: string): { isValid: boolean; message: string } => {
  const isNumeric = /^\d+$/.test(code);
  const isValidLength = code.length === 6;

  if (!isNumeric) {
    return {
      isValid: false,
      message: 'Doğrulama kodu sadece rakamlardan oluşmalıdır.'
    };
  }

  if (!isValidLength) {
    return {
      isValid: false,
      message: 'Doğrulama kodu 6 haneli olmalıdır.'
    };
  }

  return {
    isValid: true,
    message: ''
  };
}; 