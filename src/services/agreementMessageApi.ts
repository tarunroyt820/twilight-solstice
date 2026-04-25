import http from "./http";
import { getAuthHeader } from "@/utils/authToken";

const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

export interface AgreementMessageSender {
  _id?: string;
  fullName?: string;
  name?: string;
  profilePhotoUrl?: string;
}

export interface AgreementMessageItem {
  _id: string;
  agreementId: string;
  senderId?: AgreementMessageSender | null;
  message: string;
  systemMessage?: boolean;
  createdAt?: string;
}

export interface MessageInboxSummary {
  agreementId: string;
  agreementStatus: "active" | "completed" | "disputed" | "cancelled";
  skill: string;
  updatedAt?: string;
  unreadCount: number;
  partner: {
    _id: string;
    fullName?: string;
    profilePhotoUrl?: string;
    lastActiveAt?: string | null;
  } | null;
  latestMessage: {
    _id: string;
    message: string;
    createdAt?: string;
    systemMessage?: boolean;
    senderId?: AgreementMessageSender | null;
  } | null;
}

export const fetchInboxSummaries = () => {
  return http.get<{ success: boolean; inbox: MessageInboxSummary[] }>(
    `${BASE_URL}/agreements/inbox`,
    {
      headers: getAuthHeader(),
    },
  );
};

export const fetchAgreementMessages = (agreementId: string) => {
  return http.get<{ success: boolean; messages: AgreementMessageItem[] }>(
    `${BASE_URL}/agreements/${agreementId}/messages`,
    {
      headers: getAuthHeader(),
    },
  );
};

export const sendAgreementMessage = (agreementId: string, message: string) => {
  return http.post<{ success: boolean; message: AgreementMessageItem }>(
    `${BASE_URL}/agreements/${agreementId}/messages`,
    { message },
    {
      headers: getAuthHeader(),
    },
  );
};
