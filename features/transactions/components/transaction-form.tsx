import { z } from 'zod';

import { insertTransactionSchema } from '@/db/schema';


const formSchema = z.object({
	date: z.coerce.date(),
	accountId: z.string(),
	categoryId: z.string().nullable().optional(),
	payee: z.string(),
	amount: z.string(),
	notes: z.string().nullable().optional(),
});

const apiSchema = insertTransactionSchema.omit({
	id: true,
});

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

type TransactionFormProps = {
	id?: string;
	defaultValues?: FormValues;
	onSubmit: (values: ApiFormValues) => void;
	onDelete?: () => void;
	disabled?: boolean;
	accountOptions: { label: string; value: string }[];
	categoryOptions: { label: string; value: string }[];
	onCreateAccount: (name: string) => void;
	onCreateCategory: (name: string) => void;
};

export const TransactionForm = ({
	id,
	defaultValues,
	onSubmit,
	onDelete,
	disabled,
	accountOptions,
	categoryOptions,
	onCreateAccount,
	onCreateCategory,
}: TransactionFormProps) => {

};
