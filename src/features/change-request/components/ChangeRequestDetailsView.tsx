"use client";

import { useMemo } from "react";

import { TabsLayout, ActionModal } from "@/components/shared";
import {
    ChangeRequestHeader,
    RejectReasonPopup,
} from "@/features/change-request/components";
import { ApprovalList, ApprovalListSkeleton } from "@/features/approval/components";


import {
    createWidgetStore,
} from "@openg2p/registry-widgets";
import { useTranslations } from "next-intl";
import { RegisterFlattenedRecord } from "@/features/register/types";
import { useChangeRequestManager, useRegisterSectionsFromCR } from "@/features/change-request/hooks";
import { useApprovals } from "@/features/approval/hooks/useApprovals";
import { parseAweCurrentStage } from "@/features/approval/utils/aweStatusSummary";
import { REGISTRY_CHANGE_REQUEST_ARTIFACT } from "@/features/approval/constants";
import { ChangeRequestValuesTabs } from "./ChangeRequestValuesTabs";
import CRHeaderSkeleton from "./CRHeaderSkeleton";
import SectionSchemaSkeleton from "./SectionSchemaSkeleton";

interface Props {
    changeId: string;
    breadcrumb: { label: string; href?: string }[];
}

export default function ChangeRequestDetailsView({ changeId, breadcrumb }: Props) {
    const t = useTranslations();
    const {
        details,
        documents,
        loadingDetails,
        loadingDocuments,
        loadingAction,
        popupVisible,
        popupType,
        setPopupVisible,
        handleApprove,
        handleReject,
        submitReject,
        refetchDetails,
    } = useChangeRequestManager(changeId);

    const approvalArtifactContext = useMemo(() => {
        if (!details?.change_request_id) return null;
        const currentStage =
            parseAweCurrentStage(details.awe_request_status_summary) ?? 1;
        return {
            artifactId: details.change_request_id,
            artifactType: REGISTRY_CHANGE_REQUEST_ARTIFACT,
            currentStage,
        };
    }, [details?.change_request_id, details?.awe_request_status_summary]);

    const { tasks, loadingTasks, submitDecision } = useApprovals(
        details?.awe_request_id,
        approvalArtifactContext,
        refetchDetails,
    );

    const widgetStoreOld = useMemo(() => createWidgetStore(), []);
    const widgetStoreNew = useMemo(() => createWidgetStore(), []);
    const sectionId = details?.section_id;
    const sectionRegisterId = details?.section_register_id || "";
    const isListSection = details?.is_list || false;

    const { sectionUISchema, loadingSchema } = useRegisterSectionsFromCR({ sectionId });

    const newSectionData = useMemo(() => {
        if (!details?.change_payload?.length) return undefined;

        const map: Record<
            string,
            RegisterFlattenedRecord | { records: RegisterFlattenedRecord[] }
        > = {};

        if (isListSection === true) {
            map[sectionRegisterId] = {
                records: details.change_payload,
            };
        } else {
            map[sectionRegisterId] = details.change_payload[0];
        }

        return map;
    }, [details]);

    const oldSectionData = useMemo(() => {
        if (!details?.current_register_data?.length) return undefined;

        const map: Record<
            string,
            RegisterFlattenedRecord | { records: RegisterFlattenedRecord[] }
        > = {};

        if (isListSection === true) {
            map[sectionRegisterId] = {
                records: details.current_register_data,
            };
        } else {
            map[sectionRegisterId] = details.current_register_data[0];
        }

        return map;
    }, [details, isListSection, sectionRegisterId]);

    return (
        <TabsLayout breadcrumb={breadcrumb}>
            <div className="flex gap-7.5">
                <div className="w-full lg:w-[75%]">
                    {loadingDetails || loadingDocuments ? (
                        <CRHeaderSkeleton />
                    ) : (
                        details && (
                            <ChangeRequestHeader
                                details={details}
                                verificationCount={details.no_of_verifications_done ?? 0}
                                documents={documents}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                loadingAction={loadingAction}
                            />
                        )
                    )}

                    {loadingSchema ? (
                        <SectionSchemaSkeleton />
                    ) : (
                        details && (
                            <ChangeRequestValuesTabs
                                widgetStoreNew={widgetStoreNew}
                                widgetStoreOld={widgetStoreOld}
                                newSectionData={newSectionData}
                                oldSectionData={oldSectionData}
                                sectionUISchema={sectionUISchema}
                                t={t}
                                changeId={changeId}
                            />
                        )
                    )}
                </div>

                <div className="w-full lg:w-[25%]">
                    {loadingDetails || (!!details?.awe_request_id && loadingTasks) ? (
                        <ApprovalListSkeleton />
                    ) : (
                        <ApprovalList
                            tasks={tasks}
                            isPending={details?.approval_status === "PENDING"}
                            onSubmitDecision={submitDecision}
                        />
                    )}
                </div>
            </div>
            {popupVisible && popupType === "reject-input" && (
                <RejectReasonPopup
                    onSubmit={(reason) => submitReject(reason)}
                    onClose={() => setPopupVisible(false)}
                    loading={loadingAction}
                />
            )}
        </TabsLayout>
    );
}
