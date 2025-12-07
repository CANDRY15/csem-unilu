import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Publications from "./pages/Publications";
import Events from "./pages/Events";
import Team from "./pages/Team";
import DepartmentDetail from "./pages/DepartmentDetail";
import ComiteMemberDetail from "./pages/ComiteMemberDetail";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ArticleReview from "./pages/ArticleReview";
import MySubmissions from "./pages/MySubmissions";
import Journal from "./pages/Journal";
import JournalIssue from "./pages/JournalIssue";
import JournalArticle from "./pages/JournalArticle";
import JournalSubmit from "./pages/JournalSubmit";
import JournalCommittee from "./pages/JournalCommittee";
import JournalInstructions from "./pages/JournalInstructions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/events" element={<Events />} />
            <Route path="/team" element={<Team />} />
            <Route path="/team/department/:id" element={<DepartmentDetail />} />
            <Route path="/team/comite/:id" element={<ComiteMemberDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/article-review" element={<ArticleReview />} />
            <Route path="/my-submissions" element={<MySubmissions />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/volume-:volumeNum/numero-:issueNum" element={<JournalIssue />} />
            <Route path="/article/:slug" element={<JournalArticle />} />
            <Route path="/journal/soumettre" element={<JournalSubmit />} />
            <Route path="/journal/comite" element={<JournalCommittee />} />
            <Route path="/journal/instructions" element={<JournalInstructions />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
