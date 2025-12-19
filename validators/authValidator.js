const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().min(6, 'Phone is required'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
        role: z.enum(['admin', 'trainer', 'member']).optional(),
        gender: z.enum(['Male', 'Female', 'Others'], {
            errorMap: () => ({ message: 'Please select a valid gender' })
        })
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required')
    })
});

const updatePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(6, 'New password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "New passwords don't match",
        path: ["confirmPassword"],
    })
});

module.exports = {
    registerSchema,
    loginSchema,
    updatePasswordSchema
};
