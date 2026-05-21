import { ApprovalTask } from '@/features/approval/types/approval';
import ApprovalCard from '@/features/approval/components/ApprovalCard';
import { useTranslations } from 'next-intl';
import { VERIFICATION_CHANGE_REQUEST_ACTIONS } from '@/features/change-request/utils/verificationChangeRequest.actions';
import Can from '@/components/shared/Can';

interface Props {
    tasks: ApprovalTask[];
    isPending: boolean;
    onSubmitDecision: (taskId: string, action: 'approve' | 'reject', comment: string) => Promise<boolean>;
}

export default function ApprovalList({ tasks, isPending, onSubmitDecision }: Props) {
    const t = useTranslations();

    return (
        <Can action={VERIFICATION_CHANGE_REQUEST_ACTIONS.view}>
            <div className="rounded-lg space-y-4">
                <div className="flex justify-between bg-primary-first px-6 py-4 rounded-[10px] items-center">
                    <h4 className="text-[24px] font-semibold">{t('approvals')}</h4>
                </div>

                <div className="space-y-3">
                    {tasks.length === 0 ? (
                        <div className="py-4 text-center text-neutral-first/50 text-sm">
                            {t('no_approval_tasks')}
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <ApprovalCard
                                key={task.id}
                                task={task}
                                isPending={isPending}
                                onSubmit={onSubmitDecision}
                            />
                        ))
                    )}
                </div>
            </div>
        </Can>
    );
}
