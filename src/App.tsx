import { useEffect, useState, type FormEvent } from "react";
import {
  getPlatform,
  getPlatformExperienceForLicenses,
  getLimitedExperienceNoteForLicenses,
  enterpriseLicenses,
  platforms,
  smbLicenses,
  getPlatformRepositories,
  getWindowsServerLicenseNotes,
  isPlatformAvailableForLicenses,
  toggleLicenseSelection,
  togglePlatformSelection,
  type License,
  type Platform,
} from "./catalog";
import {
  filterPlatformsByTopics,
  getRepositoryMetadata,
  getTotalTemplateCount,
  type RepositoryMetadata,
  type RepositoryMetadataIndex,
} from "./repositoryMetadata";

type Step = "license" | "platform" | "blocked" | "result" | "overview";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
      <path d="M7 4h9v9M16 4 5 15M4 7v9h9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function LicenseGrid({
  items,
  selected,
  onToggle,
}: {
  items: readonly License[];
  selected: readonly License[];
  onToggle: (license: License) => void;
}) {
  return (
    <div className="card-grid license-grid">
      {items.map((license) => {
        const isSelected = selected.some((item) => item.id === license.id);
        return (
          <button
            className={`choice-card ${isSelected ? "selected" : ""}`}
            type="button"
            key={license.id}
            aria-pressed={isSelected}
            onClick={() => onToggle(license)}
          >
            <span className="choice-icon" aria-hidden="true">M365</span>
            <span className="choice-name">{license.name}</span>
            <span className="choice-check" aria-hidden="true">{isSelected ? "\u2713" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const platformActive = step === "platform" || step === "result";
  return (
    <div className="steps" aria-label="Progress">
      <div className="step-item active">
        <span aria-hidden="true">1</span>
        <strong>Licenses</strong>
      </div>
      <div className="step-line" aria-hidden="true" />
      <div className={`step-item ${platformActive ? "active" : ""}`}>
        <span aria-hidden="true">2</span>
        <strong>Platform/Solution</strong>
      </div>
      <div className="step-line" aria-hidden="true" />
      <div className={`step-item ${step === "result" ? "active" : ""}`}>
        <span aria-hidden="true">3</span>
        <strong>Templates</strong>
      </div>
    </div>
  );
}

function RepositoryDetails({
  repositories,
  metadata,
}: {
  repositories: ReturnType<typeof getPlatformRepositories>;
  metadata: readonly RepositoryMetadata[];
}) {
  return (
    <div className="repository-descriptions">
      {repositories.map((repository) => {
        const repositoryMetadata = getRepositoryMetadata(
          metadata,
          repository.url,
        );
        const description =
          repositoryMetadata?.description || repository.description;

        return (
          <section key={repository.url}>
            {repositories.length > 1 && <h3>{repository.name}</h3>}
            <p>{description}</p>
            <div
              className="repository-topics"
              aria-label={`${repository.name} GitHub topics`}
            >
              {repositoryMetadata && repositoryMetadata.topics.length > 0 ? (
                repositoryMetadata.topics.map((topic) => (
                  <span className="repository-topic" key={topic}>{topic}</span>
                ))
              ) : (
                <span className="repository-topic empty">No topics configured</span>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function App() {
  const [step, setStep] = useState<Step>("license");
  const [overviewReturnStep, setOverviewReturnStep] = useState<Step>("license");
  const [selectedLicenses, setSelectedLicenses] = useState<License[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [repositoryMetadata, setRepositoryMetadata] = useState<
    RepositoryMetadataIndex
  >({ generatedAt: "", repositories: [] });
  const [metadataStatus, setMetadataStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const eligibleLicenses = selectedLicenses.filter((license) => license.eligible);
  const eligibleLicenseIds = eligibleLicenses.map((license) => license.id);
  const totalTemplateCount = getTotalTemplateCount(repositoryMetadata.repositories);
  const overviewPlatforms = filterPlatformsByTopics(
    platforms,
    repositoryMetadata.repositories,
    searchQuery,
  );

  useEffect(() => {
    document.getElementById("main-title")?.focus();
  }, [step]);

  useEffect(() => {
    let cancelled = false;

    async function loadRepositoryMetadata() {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}repository-metadata.json`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error(`Repository metadata request failed: ${response.status}`);
        }
        const index = await response.json() as RepositoryMetadataIndex;
        if (!Array.isArray(index.repositories)) {
          throw new Error("Repository metadata is invalid.");
        }
        if (!cancelled) {
          setRepositoryMetadata(index);
          setMetadataStatus("ready");
        }
      } catch (error) {
        console.error("Unable to load repository topics.", error);
        if (!cancelled) setMetadataStatus("error");
      }
    }

    void loadRepositoryMetadata();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleLicense(license: License) {
    setSelectedLicenses((current) => toggleLicenseSelection(current, license));
  }

  function continueFromLicenses() {
    if (eligibleLicenses.length === 0) {
      setStep("blocked");
      return;
    }

    setSelectedPlatforms((current) =>
      current.filter((platform) =>
        isPlatformAvailableForLicenses(eligibleLicenseIds, platform.id),
      ),
    );
    setStep("platform");
  }

  function togglePlatform(platform: Platform) {
    setSelectedPlatforms((current) =>
      togglePlatformSelection(current, getPlatform(platform.id)),
    );
  }

  function startOver() {
    setSelectedLicenses([]);
    setSelectedPlatforms([]);
    setStep("license");
  }

  function showOverview() {
    setOverviewReturnStep(step === "overview" ? overviewReturnStep : step);
    setStep("overview");
  }

  function submitRepositorySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={import.meta.env.BASE_URL} aria-label="ALSO Microsoft Security Policy Templates Navigator home">
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}also-logo.png`} alt="ALSO" />
            <span className="brand-divider" aria-hidden="true" />
            <span className="brand-product">ALSO Microsoft Security Policy Templates Navigator</span>
          </a>
          <div className="header-actions">
            <button
              className="button secondary issue-link"
              type="button"
              onClick={showOverview}
            >
              Overview
            </button>
            <a
              className="button secondary issue-link"
              href="https://github.com/CoC-MS/ALSO-security-policy-templates-navigator/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
            >
              Report problem
            </a>
          </div>
        </div>
      </header>

      <main>
        <div className="content">
          {step !== "blocked" && step !== "overview" && <StepIndicator step={step} />}

          {step === "overview" && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-heading">
                <div className="eyebrow">Complete template catalog</div>
                <h1 id="main-title" tabIndex={-1}>All security policy templates</h1>
                <p>Browse every available platform and open its policy template repository directly.</p>
              </div>
              <form
                className="repository-search"
                role="search"
                onSubmit={submitRepositorySearch}
              >
                <label htmlFor="repository-search">Search policy templates</label>
                <div className="repository-search-controls">
                  <input
                    id="repository-search"
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search GitHub topics, for example agentsecurity..."
                    disabled={metadataStatus !== "ready"}
                  />
                  <button className="button primary" type="submit">Search</button>
                  {searchQuery && (
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        setSearchQuery("");
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
              <div aria-live="polite">
                {metadataStatus === "loading" && (
                  <p className="search-summary">Loading GitHub topics...</p>
                )}
                {metadataStatus === "error" && (
                  <p className="search-summary search-error" role="alert">
                    GitHub topics are temporarily unavailable.
                  </p>
                )}
                {metadataStatus === "ready" && searchQuery && (
                  <p className="search-summary">
                    {overviewPlatforms.length === 0
                      ? `No repository topics found for "${searchQuery}".`
                      : `${overviewPlatforms.length} ${overviewPlatforms.length === 1 ? "repository section" : "repository sections"} found for "${searchQuery}".`}
                    {repositoryMetadata.generatedAt && (
                      <span className="search-index-date">
                        {" "}Topics refreshed {new Date(repositoryMetadata.generatedAt).toLocaleDateString()}.
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="overview-heading">
                <h2>Repository overview</h2>
                <p>Browse all repositories directly.</p>
              </div>
              <div className="recommendation-grid">
                {overviewPlatforms.map((platform) => {
                  const repositories = getPlatformRepositories(platform);
                  return (
                    <article className="recommendation-card" key={platform.id}>
                      <span className="choice-icon" aria-hidden="true">{platform.shortLabel}</span>
                      <h2>{platform.name}</h2>
                      <RepositoryDetails
                        repositories={repositories}
                        metadata={repositoryMetadata.repositories}
                      />
                      <div className="repository-links">
                        {repositories.map((repository) => (
                          <a
                            className="button primary repository-link"
                            href={repository.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={repository.url}
                          >
                            Open {repository.name} repository <ArrowIcon />
                          </a>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="actions centered">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setStep(overviewReturnStep)}
                >
                  &larr; Back
                </button>
              </div>
            </section>
          )}

          {step === "license" && (
            <section aria-labelledby="main-title">
              {metadataStatus === "ready" && totalTemplateCount !== undefined && (
                <aside className="template-highlight" aria-label="Free security policy templates">
                  <strong>{totalTemplateCount.toLocaleString()}+</strong>
                  <div>
                    <span>Pre-configured security policy templates. Ready to use.</span>
                    <p>Strengthen your Microsoft environments with expert-built templates at <b>zero cost.</b></p>
                  </div>
                </aside>
              )}
              <div className="eyebrow">Find your security policy templates</div>
              <h1 id="main-title" tabIndex={-1}>Which Microsoft 365 licenses do you have today?</h1>
              <p className="intro">Select all your current licenses to see which ALSO security policy templates are available to your organization.</p>
              <div className="license-section" aria-labelledby="enterprise-heading">
                <h2 id="enterprise-heading">Enterprise</h2>
                <LicenseGrid items={enterpriseLicenses} selected={selectedLicenses} onToggle={toggleLicense} />
              </div>
              <div className="license-section" aria-labelledby="smb-heading">
                <h2 id="smb-heading">SMB</h2>
                <LicenseGrid items={smbLicenses} selected={selectedLicenses} onToggle={toggleLicense} />
              </div>
              {selectedLicenses.length > 0 && (
                <div className="actions license-actions">
                  <button
                    className="button primary"
                    type="button"
                    onClick={continueFromLicenses}
                  >
                    Continue with {selectedLicenses.length} license{selectedLicenses.length === 1 ? "" : "s"} &rarr;
                  </button>
                </div>
              )}
            </section>
          )}

          {step === "platform" && eligibleLicenses.length > 0 && (
            <section aria-labelledby="main-title">
              <div className="selection-pills" aria-label="Selected eligible licenses">
                {eligibleLicenses.map((license) => (
                  <span className="selection-pill" key={license.id}>
                    <span aria-hidden="true">&#10003;</span>{license.name}
                  </span>
                ))}
              </div>
              <h1 id="main-title" tabIndex={-1}>Which platforms or solutions do you need security templates for?</h1>
              <p className="intro">Select one or more platforms, then continue to see every relevant policy template repository.</p>
              <div className="card-grid platform-grid" aria-label="Platforms and solutions">
                {platforms
                  .filter((platform) =>
                    isPlatformAvailableForLicenses(eligibleLicenseIds, platform.id),
                  )
                  .map((platform) => {
                    const isSelected = selectedPlatforms.some((item) => item.id === platform.id);
                    const experience = getPlatformExperienceForLicenses(
                      eligibleLicenseIds,
                      platform.id,
                    );
                    return (
                      <button
                        className={`choice-card platform-card ${isSelected ? "selected" : ""}`}
                        type="button"
                        key={platform.id}
                        aria-pressed={isSelected}
                        onClick={() => togglePlatform(platform)}
                      >
                        <span className="choice-icon" aria-hidden="true">{platform.shortLabel}</span>
                        <span className="choice-details">
                          <span className="choice-name">{platform.name}</span>
                          <span className={`experience-badge ${experience}`}>
                            {experience === "full" ? "Full experience" : "Limited experience"}
                          </span>
                        </span>
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

          {step === "blocked" && selectedLicenses.length > 0 && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-card blocked-card">
                <div className="result-icon blocked-icon" aria-hidden="true">!</div>
                <div className="eyebrow">License prerequisite</div>
                <h1 id="main-title" tabIndex={-1}>A higher license is needed</h1>
                <p>{selectedLicenses.map((license) => license.name).join(" and ")} {selectedLicenses.length === 1 ? "does" : "do"} not meet the minimum prerequisite for these security policy templates.</p>
                <p>The minimum supported license is <strong>Microsoft 365 Business Premium</strong>. No applicable templates are available for your selected licenses.</p>
                <button className="button primary" type="button" onClick={startOver}>&larr; Start over</button>
              </div>
            </section>
          )}

          {step === "result" && eligibleLicenses.length > 0 && selectedPlatforms.length > 0 && (
            <section className="result-wrap" aria-labelledby="main-title">
              <div className="result-heading">
                <div className="result-icon" aria-hidden="true">&#10003;</div>
                <div className="eyebrow">Recommended repositories</div>
                <h1 id="main-title" tabIndex={-1}>Your security template repositories</h1>
                <p>Based on <strong>{eligibleLicenses.map((license) => license.name).join(", ")}</strong>, here are the repositories for your {selectedPlatforms.length} selected {selectedPlatforms.length === 1 ? "platform" : "platforms"}.</p>
              </div>
              <div className="recommendation-grid">
                {selectedPlatforms.map((platform) => {
                  const repositories = getPlatformRepositories(platform);
                  const limitedExperienceNote =
                    getLimitedExperienceNoteForLicenses(
                      eligibleLicenseIds,
                      platform.id,
                    );
                  const windowsServerNotes =
                    platform.id === "windows-servers" ||
                    platform.id === "linux-server"
                      ? getWindowsServerLicenseNotes(eligibleLicenseIds)
                      : [];
                  return (
                    <article className="recommendation-card" key={platform.id}>
                      <span className="choice-icon" aria-hidden="true">{platform.shortLabel}</span>
                      <h2>{platform.name}</h2>
                      <RepositoryDetails
                        repositories={repositories}
                        metadata={repositoryMetadata.repositories}
                      />
                      {limitedExperienceNote && (
                        <aside className="license-requirement-note">
                          <strong>{limitedExperienceNote.title}</strong>
                          <p>{limitedExperienceNote.message}</p>
                        </aside>
                      )}
                      {windowsServerNotes.map((note) => (
                        <aside className="license-requirement-note" key={note}>
                          <strong>Additional server license required</strong>
                          <p>{note}</p>
                        </aside>
                      ))}
                      <div className="repository-links">
                        {repositories.map((repository) => (
                          <a
                            className="button primary repository-link"
                            href={repository.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={repository.url}
                          >
                            Open {repository.name} repository <ArrowIcon />
                          </a>
                        ))}
                      </div>
                    </article>
                  );
                })}
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
