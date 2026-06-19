import React, { Component, StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <BootError error={this.state.error} />;
    }

    return this.props.children;
  }
}

function BootError({ error }) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24, color: "#18181b" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Crypto Refund Portal</h1>
      <p>The app could not start in this browser session.</p>
      <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{error?.message || "Unknown startup error"}</pre>
    </div>
  );
}

try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  ReactDOM.createRoot(document.getElementById("root")).render(<BootError error={error} />);
}
