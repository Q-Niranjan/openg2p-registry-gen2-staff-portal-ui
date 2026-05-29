import { useFetch } from '@/shared/hooks/useFetch';
import { IntakeFormSubmission } from '../types/intake-form';

export const useIntakeFormSubmission = (submissionId?: string) => {
    const { data, loading, error, execute } = useFetch<IntakeFormSubmission>({
        url: '/api/intake-form/get-intake-form-submission',
        options: {
            method: 'POST',
            body: JSON.stringify({
                submission_id: submissionId,
            }),
        },
        enabled: !!submissionId,
    });

    return {
        submission: data,
        section_payloads: data?.section_payloads,
        loading,
        error,
        execute,
    };
};
