import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppState } from "@/hooks/useAppState";
import { useRTVIClient } from "@pipecat-ai/client-react";
import { LoaderCircleIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import emitter from "@/lib/eventEmitter";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Define types for ICSR data structure
type ChapterName = "Process Overview" | "Case Intake" | "Case Processing" | "Quality Control";

interface ICSRDataStructure {
    subject: string;
    chapters: Record<ChapterName, string[]>;
}

// ICSR topics data structure
const ICSR_DATA: ICSRDataStructure = {
    subject: "ICSR",
    chapters: {
        "Process Overview": [
            "What is in ICSR?",
            "Different Reports and Report Types",
            "What is adverse event, adverse reaction, Incident, undesirable effect",
            "What is valid case, and non-valid case",
            "What is safety case, PQC case",
            "What is serious case and non-serious case",
            "What are special events, eg: pregnancy, medication error etc",
            "What is causality, listedness, action taken, Dechallenge and rechallenge",
            "What are mandatory fields required for outbound reporting"
        ],
        "Case Intake": [
            "Case intake Process SOP as per Safety Database application",
            "Manual case intake processing",
            "Case intake via automated intake sources",
            "Duplicate search functionality"
        ],
        "Case Processing": [
            "Death/Fatal Case Processing",
            "Literature case processing",
            "Pregnancy case processing",
            "Study case processing",
            "Blinding and unblinding processing",
            "Device case processing"
        ],
        "Quality Control": [
            "Case deletion and Nullification process",
            "Inline Quality control process",
            "Different types of quality checks",
            "Process flow for Serious and Non-serious cases",
            "Medical review process"
        ]
    }
} as const;

export default function TeacherMode() {
    const [isConnecting, setIsConnecting] = useState(false);
    const rtviClient = useRTVIClient();
    const { toast } = useToast();

    const {
        setConversationId,
        teacherChapter,
        setTeacherChapter,
        teacherTopic,
        setTeacherTopic,
        setTeacherSubject
    } = useAppState();

    useEffect(() => {
        // Set initial subject when component mounts
        setTeacherSubject(ICSR_DATA.subject);
    }, []); // Run once on mount

    const handleStartSession = async () => {
        try {
            setIsConnecting(true);

            // First create a new conversation
            const conversationResponse = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/conversations`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: `${ICSR_DATA.subject} - ${teacherTopic}`
                    }),
                }
            );

            if (!conversationResponse.ok) {
                throw new Error("Failed to create conversation");
            }

            const { conversation_id } = await conversationResponse.json();
            setConversationId(conversation_id);

            // Then set up RTVI client
            if (rtviClient) {
                // Update params but keep the original endpoint configuration
                rtviClient.params = {
                    ...rtviClient.params,
                    requestData: {
                        conversation_id: conversation_id,
                        subject: ICSR_DATA.subject,
                        chapter: teacherChapter,
                        topic: teacherTopic,
                        mode: "teacher",
                        bot_profile: "text-voice" // Keep as text-voice for Daily transport
                    }
                };

                try {
                    await rtviClient.connect();
                    emitter.emit("showChatMessages");

                    toast({
                        title: "Teaching Session Started",
                        description: `Started session for ${ICSR_DATA.subject} - ${teacherTopic}`
                    });
                } catch (error) {
                    console.error("Connection error:", error);
                    toast({
                        variant: "destructive",
                        title: "Connection Error",
                        description: "Failed to establish teaching session"
                    });
                }
            }

        } catch (error) {
            console.error("Error starting teaching session:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to start teaching session"
            });
        } finally {
            setIsConnecting(false);
        }
    };

    const handleChapterChange = (value: ChapterName) => {
        setTeacherChapter(value);
        setTeacherTopic(""); // Reset topic when chapter changes
    };

    return (
        <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold mb-4">Configure Teaching Session</h2>
                <p className="text-muted-foreground">
                    Select a chapter and topic to start learning about ICSR
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                        id="subject"
                        value={ICSR_DATA.subject}
                        readOnly
                        className="bg-muted"
                    />
                </div>

                <div>
                    <Label htmlFor="chapter">Chapter</Label>
                    <Select
                        value={teacherChapter}
                        onValueChange={handleChapterChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a chapter" />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(ICSR_DATA.chapters) as ChapterName[]).map((chapter) => (
                                <SelectItem key={chapter} value={chapter}>
                                    {chapter}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Select
                        value={teacherTopic}
                        onValueChange={setTeacherTopic}
                        disabled={!teacherChapter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                            {teacherChapter && ICSR_DATA.chapters[teacherChapter as ChapterName].map((topic) => (
                                <SelectItem key={topic} value={topic}>
                                    {topic}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    disabled={!teacherChapter || !teacherTopic || isConnecting}
                    onClick={handleStartSession}
                    className="w-full mt-4"
                >
                    {isConnecting ? (
                        <>
                            <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                            Starting teaching session...
                        </>
                    ) : (
                        "Start Teaching Session"
                    )}
                </Button>
            </div>
        </div>
    );
}
