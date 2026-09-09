import { loadConversation } from "./chatbot/loadConversation";
import { closeConversation } from "./chatbot/closeConversation";
import { getAndIndexAllEvents } from "./events/getAndIndexAllEvents";
import { getAndIndexEvent } from "./events/getAndIndexEvent";
import { getAndIndexEventsWithoutBrand } from "./events/getAndIndexEventsWithoutBrand";
import { getAndIndexPage } from "./pages/getAndIndexPage";
import { getAndIndexAllPrograms } from "./programs/getAndIndexAllPrograms";
import { getAndIndexProgram } from "./programs/getAndIndexProgram";
import { getAndIndexProgramsWithoutBrand } from "./programs/getAndIndexProgramsWithoutBrand";
import { createLead } from "./chatbot/createLead";

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
        createLead,
    },
};
