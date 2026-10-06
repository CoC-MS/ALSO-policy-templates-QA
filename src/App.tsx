import { useEffect, useState } from "react";
import {
  getPlatform,
  enterpriseLicenses,
  platforms,
  smbLicenses,
  togglePlatformSelection,
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

function LicenseGrid({
  items,
  onChoose,
}: {
  items: readonly License[];
  onChoose: (license: License) => void;
}) {
  return (
    <div className="card-grid license-grid">
      {items.map((license) => (
        <button className="choice-card" type="button" key={license.id} onClick={() => onChoose(license)}>
          <span className="choice-icon" aria-hidden="true">M365</span>
          <span className="choice-name">{license.name}</span>
          <span className="choice-arrow" aria-hidden="true">&rarr;</span>
        </button>
      ))}
    </div>
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
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    document.getElementById("main-title")?.focus();
  }, [step]);

  function chooseLicense(license: License) {
    setSelectedLicense(license);
    setSelectedPlatforms([]);
    setStep(license.eligible ? "platform" : "blocked");
  }

  function togglePlatform(platform: Platform) {
    setSelectedPlatforms((current) =>
      togglePlatformSelection(current, getPlatform(platform.id)),
    );
  }

  function startOver() {
    setSelectedLicense(undefined);
    setSelectedPlatforms([]);
    setStep("license");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={import.meta.env.BASE_URL} aria-label="ALSO Policy Templates Guide home">
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}also-logo.png`} alt="ALSO" />
            <span className="brand-divider" aria-hidden="true" />
            <span className="brand-product">Security Policy Templates for Microsoft environments Navigator</span>
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
              <div className="license-section" aria-labelledby="enterprise-heading">
                <h2 id="enterprise-heading">Enterprise</h2>
                <LicenseGrid items={enterpriseLicenses} onChoose={chooseLicense} />
              </div>
              <div className="license-section" aria-labelledby="smb-heading">
                <h2 id="smb-heading">SMB</h2>
                <LicenseGrid items={smbLicenses} onChoose={chooseLicense} />
              </div>
            </section>
          )}

          {step === "platform" && selectedLicense && (
            <section aria-labelledby="main-title">
              <div className="selection-pill"><span aria-hidden="true">&#10003;</span>{selectedLicense.name}</div>
              <h1 id="main-title" tabIndex={-1}>Which platforms or solutions do you need security templates for?</h1>
              <p className="intro">Select one or more platforms, then continue to see every relevant policy template repository.</p>
              <div className="card-grid platform-grid" aria-label="Platforms and solutions">
                {platforms.map((platform) => {
                  const isSelected = selectedPlatforms.some((item) => item.id === platform.id);
                  return (
                    <button
                      className={`choice-card platform-card ${isSelected ? "selected" : ""}`}
                      type="button"
                      key={platform.id}
                      aria-pressed={isSelected}
                      onClick={() => togglePlatform(platform)}
                    >
                      <span className="choice-icon" aria-hidden="true">{platform.shortLabel}</span>
                      <span className="choice-name">{platform.name}</span>
                      <span className="choice-check" aria-hidden="true">{isSelected ? "\u2713" : ""}</span>
                    </button>
                  );
                })}
              </div>
              <div className="actions platform-actions">
                <div>
                  <button className="button secondary" type="button" onClick={() => setStep("license")}>&larr; Back</button>
                  <button className="button text-button" type="button" onClick={startOver}>Start over</button>
                </div>
                <button
                  className="button primary"
                  type="button"
                  disabled={selectedPlatforms.length === 0}
                  onClick={() => setStep("result")}
                >
                  {selectedPlatforms.length === 0
                    ? "Select at least one platform"
                    : `View ${selectedPlatforms.length} recommendation${selectedPlatforms.length === 1 ? "" : "s"}`} &rarr;
                </button>
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

          {step === "result" && selectedLicense && selectedPlatforms.length > 0 && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-heading">
                <div className="result-icon" aria-hidden="true">&#10003;</div>
                <div className="eyebrow">Recommended repositories</div>
                <h1 id="main-title" tabIndex={-1}>Your security template repositories</h1>
                <p>Based on <strong>{selectedLicense.name}</strong>, here are the repositories for your {selectedPlatforms.length} selected {selectedPlatforms.length === 1 ? "platform" : "platforms"}.</p>
              </div>
              <div className="recommendation-grid">
                {selectedPlatforms.map((platform) => (
                  <article className="recommendation-card" key={platform.id}>
                    <span className="choice-icon" aria-hidden="true">{platform.shortLabel}</span>
                    <h2>{platform.name}</h2>
                    <p>{platform.description}</p>
                    <a className="button primary repository-link" href={platform.repository} target="_blank" rel="noopener noreferrer">
                      Open {platform.name} repository <ArrowIcon />
                    </a>
                  </article>
                ))}
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
