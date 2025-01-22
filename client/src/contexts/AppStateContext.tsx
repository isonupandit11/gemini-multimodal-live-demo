import { createContext, Dispatch, SetStateAction } from "react";

export type InteractionMode = "conversational" | "informational";

// Define conversation types as string literals
export const ConversationTypes = {
  VOICE_TO_VOICE: "voice-to-voice",
  TEXT_VOICE: "text-voice",
  TEACHER: "teacher"
} as const;

// Create type from the values of ConversationTypes
export type ConversationType = (typeof ConversationTypes)[keyof typeof ConversationTypes] | null;

interface AppStateContextValue {
  conversationId: string;
  setConversationId: Dispatch<SetStateAction<string>>;
  conversationType: ConversationType;
  setConversationType: Dispatch<SetStateAction<ConversationType>>;
  interactionMode: InteractionMode;
  setInteractionMode: Dispatch<SetStateAction<InteractionMode>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  geminiApiKey: string;
  webrtcEnabled: boolean;
  websocketEnabled: boolean;
  teacherSubject: string;
  setTeacherSubject: Dispatch<SetStateAction<string>>;
  teacherChapter: string;
  setTeacherChapter: Dispatch<SetStateAction<string>>;
  teacherTopic: string;
  setTeacherTopic: Dispatch<SetStateAction<string>>;
}

const noop = () => { };
export const AppStateContext = createContext<AppStateContextValue>({
  conversationId: "",
  setConversationId: noop,
  conversationType: null,
  setConversationType: noop,
  interactionMode: "informational",
  setInteractionMode: noop,
  searchQuery: "",
  setSearchQuery: noop,
  geminiApiKey: "",
  webrtcEnabled: false,
  websocketEnabled: false,
  teacherSubject: "",
  setTeacherSubject: noop,
  teacherChapter: "",
  setTeacherChapter: noop,
  teacherTopic: "",
  setTeacherTopic: noop
});
