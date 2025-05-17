import {Route, Switch} from "wouter";
import {queryClient} from "./lib/queryClient";
import {QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "@/components/ui/toaster";
import {TooltipProvider} from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import EmergencyForm from "@/pages/emergency-form";
import Processing from "@/pages/processing";
import Response from "@/pages/response";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Header from "@/components/header";
import Footer from "@/components/footer";
import EmergencySOS from "@/components/emergency-sos";
import VideoCall from "@/pages/video-call.tsx";

function Router() {
    return (
        <Switch>
            <Route path="/" component={Home}/>
            <Route path="/emergency-form/:type" component={EmergencyForm}/>
            <Route path="/processing/:id" component={Processing}/>
            <Route path="/response/:id" component={Response}/>
            <Route path="/about" component={About}/>
            <Route path="/contact" component={Contact}/>
            <Route path="/video-call" component={VideoCall}/>
            <Route component={NotFound}/>
        </Switch>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <div className="min-h-screen flex flex-col">
                    <Header/>
                    <main className="flex-grow">
                        <Router/>
                    </main>
                    <Footer/>
                    <EmergencySOS/>
                    <Toaster/>
                </div>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
