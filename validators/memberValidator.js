const { z } = require('zod');

const createMemberSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().optional(),
        gender: z.enum(['Male', 'Female', 'Others']).optional(),
        role: z.enum(['admin', 'trainer', 'member']).optional(),
        age: z.union([z.number().int().min(1).max(150), z.string()]).optional(),
        weight: z.union([z.number().min(1).max(1000), z.string()]).optional(),
        membershipStartDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
        membershipEndDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
        plan: z.string().optional(),
        class: z.string().optional(),
        classType: z.enum(['Cardio', 'Strength', 'Yoga', 'Flexibility', 'HIIT', 'Other']).optional(),
        difficultyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
        status: z.enum(['active', 'Deactive', 'pending']).optional(),
        nextBillingDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional()
    })
});

const updateMemberSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        email: z.string().email('Invalid email address').optional(),
        phone: z.string().optional(),
        gender: z.enum(['Male', 'Female', 'Others']).optional(),
        age: z.union([z.number().int().min(1).max(150), z.string()]).optional(),
        weight: z.union([z.number().min(1).max(1000), z.string()]).optional(),
        membershipStartDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
        membershipEndDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
        plan: z.string().optional(),
        class: z.string().optional(),
        classType: z.enum(['Cardio', 'Strength', 'Yoga', 'Flexibility', 'HIIT', 'Other']).optional(),
        difficultyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
        status: z.enum(['active', 'Deactive', 'pending']).optional(),
        nextBillingDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional()
    })
});

module.exports = {
    createMemberSchema,
    updateMemberSchema
};
