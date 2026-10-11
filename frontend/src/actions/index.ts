import { getAndIndexAllPosts } from "./blog/getAndIndexAllPosts";
import { getAndIndexPost } from "./blog/getAndIndexPost";
import { closeConversation } from "./chatbot/closeConversation";
import { loadConversation } from "./chatbot/loadConversation";
import { getAndIndexAllEvents } from "./events/getAndIndexAllEvents";
import { getAndIndexEvent } from "./events/getAndIndexEvent";
import { getAndIndexEventsWithoutBrand } from "./events/getAndIndexEventsWithoutBrand";
import { sendLead } from "./leads/sendLead";
import { getAndIndexPage } from "./pages/getAndIndexPage";
import { getAndIndexAllPrograms } from "./programs/getAndIndexAllPrograms";
import { getAndIndexProgram } from "./programs/getAndIndexProgram";
import { getAndIndexProgramsWithoutBrand } from "./programs/getAndIndexProgramsWithoutBrand";

export const server = {
    pages: {
        getAndIndexPage,
    },
    events: {
        getAndIndexAllEvents,
        getAndIndexEventsWithoutBrand,
        getAndIndexEvent,
    },
    programs: {
        getAndIndexAllPrograms,
        getAndIndexProgramsWithoutBrand,
        getAndIndexProgram,
    },
    chatbot: {
        loadConversation,
        closeConversation,
    },
    blog: {
        getAndIndexAllPosts,
        getAndIndexPost,
    },
    leads: {
        sendLead,
    },
};
