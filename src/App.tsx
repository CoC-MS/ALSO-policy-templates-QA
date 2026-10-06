import { useEffect, useState } from "react";
import {
  getPlatform,
  licenses,
  platforms,
  type License,
  type Platform,
} from "./catalog";

type Step = "license" | "platform" | "blocked" | "result";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
      <path d="M7 4h9v9M16 4 5 15M4 7v9h9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const platformActive = step === "platform" || step === "result";
  return (
    <div className="steps" aria-label="Progress">
      <div className="step-item active">
        <span aria-hidden="true">1</span>
        <strong>License</strong>
      </div>
      <div className="step-line" aria-hidden="true" />
      <div className={`step-item ${platformActive ? "active" : ""}`}>
        <span aria-hidden="true">2</span>
        <strong>Platform</strong>
      </div>
      <div className="step-line" aria-hidden="true" />
      <div className={`step-item ${step === "result" ? "active" : ""}`}>
        <span aria-hidden="true">3</span>
        <strong>Templates</strong>
      </div>
    </div>
  );
}

function App() {
  const [step, setStep] = useState<Step>("license");
  const [selectedLicense, setSelectedLicense] = useState<License>();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>();

  useEffect(() => {
    document.getElementById("main-title")?.focus();
  }, [step]);

  function chooseLicense(license: License) {
    setSelectedLicense(license);
    setSelectedPlatform(undefined);
    setStep(license.eligible ? "platform" : "blocked");
  }

  function choosePlatform(platform: Platform) {
    setSelectedPlatform(getPlatform(platform.id));
    setStep("result");
  }

  function startOver() {
    setSelectedLicense(undefined);
    setSelectedPlatform(undefined);
    setStep("license");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={import.meta.env.BASE_URL} aria-label="ALSO Policy Templates Guide home">
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}also-logo.png`} alt="ALSO" />
            <span className="brand-divider" aria-hidden="true" />
            <span className="brand-product">Policy Templates Guide</span>
          </a>
        </div>
      </header>

      <main>
        <div className="content">
          {step !== "blocked" && <StepIndicator step={step} />}

          {step === "license" && (
            <section aria-labelledby="main-title">
              <div className="eyebrow">Find your security templates</div>
              <h1 id="main-title" tabIndex={-1}>Which Microsoft 365 license do you have today?</h1>
              <p className="intro">Select your current license to see which ALSO security policy templates are available to your organization.</p>
              <div className="card-grid license-grid" aria-label="Microsoft 365 licenses">
                {licenses.map((license) => (
                  <button className="choice-card" type="button" key={license.id} onClick={() => chooseLicense(license)}>
                    <span className="choice-icon" aria-hidden="true">M365</span>
                    <span className="choice-name">{license.name}</span>
                    <span className="choice-arrow" aria-hidden="true">&rarr;</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === "platform" && selectedLicense && (
            <section aria-labelledby="main-title">
              <div className="selection-pill"><span aria-hidden="true">&#10003;</span>{selectedLicense.name}</div>
              <h1 id="main-title" tabIndex={-1}>Which platform or solution do you need security templates for?</h1>
              <p className="intro">Choose a platform to open the verified public repository with the relevant policy templates and guidance.</p>
              <div className="card-grid platform-grid" aria-label="Platforms and solutions">
                {platforms.map((platform) => (
                  <button className="choice-card platform-card" type="button" key={platform.id} onClick={() => choosePlatform(platform)}>
                    <span className="choice-icon" aria-hidden="true">{platform.shortLabel}</span>
                    <span className="choice-name">{platform.name}</span>
                    <span className="choice-arrow" aria-hidden="true">&rarr;</span>
                  </button>
                ))}
              </div>
              <div className="actions">
                <button className="button secondary" type="button" onClick={() => setStep("license")}>&larr; Back</button>
                <button className="button text-button" type="button" onClick={startOver}>Start over</button>
              </div>
            </section>
          )}

          {step === "blocked" && selectedLicense && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-card blocked-card">
                <div className="result-icon blocked-icon" aria-hidden="true">!</div>
                <div className="eyebrow">License prerequisite</div>
                <h1 id="main-title" tabIndex={-1}>A higher license is needed</h1>
                <p><strong>{selectedLicense.name}</strong> does not meet the minimum prerequisite for these security policy templates.</p>
                <p>The minimum supported license is Microsoft 365 Business Premium. No applicable templates are available for your selected license.</p>
                <button className="button primary" type="button" onClick={startOver}>&larr; Start over</button>
              </div>
            </section>
          )}

          {step === "result" && selectedLicense && selectedPlatform && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-card">
                <div className="result-icon" aria-hidden="true">&#10003;</div>
                <div className="eyebrow">Recommended repository</div>
                <h1 id="main-title" tabIndex={-1}>{selectedPlatform.name} security templates</h1>
                <p>{selectedPlatform.description}</p>
                <dl className="summary">
                  <div>
                    <dt>Your license</dt>
                    <dd>{selectedLicense.name}</dd>
                  </div>
                  <div>
                    <dt>Platform</dt>
                    <dd>{selectedPlatform.name}</dd>
                  </div>
                </dl>
                <a className="button primary repository-link" href={selectedPlatform.repository} target="_blank" rel="noopener noreferrer">
                  Open template repository <ArrowIcon />
                </a>
              </div>
              <div className="actions centered">
                <button className="button secondary" type="button" onClick={() => setStep("platform")}>&larr; Back</button>
                <button className="button text-button" type="button" onClick={startOver}>Start over</button>
              </div>
            </section>
          )}
        </div>
      </main>

      <footer>
        <p>ALSO Microsoft Security Central Technical Team (c) 2026 All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;
