import { IndexPage } from "./pages/Index/IndexPage";
import { LoginPage } from "./pages/Connection/Login/LoginPage";
import { SignupPage } from "./pages/Connection/Signup/SignupPage";
import { SignupFillPage } from "./pages/Connection/SignupFill/SignupFillPage";
import { ForgotPage } from "./pages/Forgot/ForgotPage";
import { NotFoundPage } from "./pages/NotFound/NotFoundPage";
import { Header } from "./components/base/Header/Header";
import { Footer } from "./components/base/Footer/Footer";
import { Routes, Route } from "react-router-dom";
import "./assets/scss/style.scss";
import "./app.scss";

function App() {
    return (
        <div className="App">
            <Header />
            <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="forgot" element={<ForgotPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="signup/fill" element={<SignupFillPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Footer />
        </div>
    );
}

export default App;
