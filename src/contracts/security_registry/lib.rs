//! StellarShield Security Registry - Soroban Smart Contract
//!
//! A decentralized on-chain security registry for the Stellar network that stores:
//! - Known malicious addresses reported by the community
//! - Wallet security scores computed by the AI agent
//! - Threat reports that can be verified on-chain
//!
//! This contract enables trustless, on-chain security intelligence that
//! any Stellar dApp or wallet can query before processing transactions.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, Map, String, Symbol, Vec,
};

/// Threat levels stored on-chain
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ThreatLevel {
    Safe,
    Low,
    Medium,
    High,
    Critical,
}

/// A security report for a Stellar address
#[contracttype]
#[derive(Clone, Debug)]
pub struct SecurityReport {
    pub target: Address,
    pub reporter: Address,
    pub threat_level: ThreatLevel,
    pub score: u32,         // 0-100 risk score
    pub category: Symbol,   // e.g., "phishing", "rug_pull", "scam"
    pub timestamp: u64,
    pub verified: bool,
    pub report_count: u32,  // Number of times this address has been reported
}

/// Contract storage keys
#[contracttype]
pub enum DataKey {
    Admin,
    Report(Address),          // Security report for an address
    ReportCount(Address),     // Number of reports for an address
    TotalReports,             // Total reports in the system
    Reporters(Address),       // Set of reporters for an address
    TrustedReporters,         // Addresses with verified reporter status
    MinReportsForFlag,        // Minimum reports needed to auto-flag
}

#[contract]
pub struct SecurityRegistry;

#[contractimpl]
impl SecurityRegistry {
    /// Initialize the contract with an admin address
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalReports, &0u32);
        env.storage().instance().set(&DataKey::MinReportsForFlag, &3u32);
    }

    /// Submit a security report for a suspicious address
    pub fn report_address(
        env: Env,
        reporter: Address,
        target: Address,
        threat_level: ThreatLevel,
        score: u32,
        category: Symbol,
    ) -> SecurityReport {
        // Verify the reporter authorized this transaction
        reporter.require_auth();

        // Validate score range
        if score > 100 {
            panic!("Score must be between 0 and 100");
        }

        // Get current report count for this address
        let report_count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::ReportCount(target.clone()))
            .unwrap_or(0);

        let new_count = report_count + 1;

        // Create/update the security report
        let report = SecurityReport {
            target: target.clone(),
            reporter: reporter.clone(),
            threat_level,
            score,
            category,
            timestamp: env.ledger().timestamp(),
            verified: false,
            report_count: new_count,
        };

        // Store the report
        env.storage()
            .persistent()
            .set(&DataKey::Report(target.clone()), &report);
        env.storage()
            .persistent()
            .set(&DataKey::ReportCount(target.clone()), &new_count);

        // Update total reports
        let total: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalReports)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalReports, &(total + 1));

        // Emit event
        env.events().publish(
            (symbol_short!("report"), target.clone()),
            (reporter, score, new_count),
        );

        report
    }

    /// Query the security status of an address
    pub fn check_address(env: Env, target: Address) -> SecurityReport {
        env.storage()
            .persistent()
            .get(&DataKey::Report(target.clone()))
            .unwrap_or(SecurityReport {
                target: target.clone(),
                reporter: target,
                threat_level: ThreatLevel::Safe,
                score: 0,
                category: symbol_short!("none"),
                timestamp: 0,
                verified: false,
                report_count: 0,
            })
    }

    /// Get the risk score for an address (0 = safe, 100 = critical)
    pub fn get_risk_score(env: Env, target: Address) -> u32 {
        let report: Option<SecurityReport> = env
            .storage()
            .persistent()
            .get(&DataKey::Report(target));

        match report {
            Some(r) => r.score,
            None => 0,
        }
    }

    /// Check if an address has been flagged as dangerous
    pub fn is_flagged(env: Env, target: Address) -> bool {
        let report: Option<SecurityReport> = env
            .storage()
            .persistent()
            .get(&DataKey::Report(target));

        match report {
            Some(r) => {
                let min_reports: u32 = env
                    .storage()
                    .instance()
                    .get(&DataKey::MinReportsForFlag)
                    .unwrap_or(3);
                r.report_count >= min_reports
                    || matches!(r.threat_level, ThreatLevel::Critical | ThreatLevel::High)
            }
            None => false,
        }
    }

    /// Admin: Verify a report as legitimate
    pub fn verify_report(env: Env, admin: Address, target: Address) {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Not initialized");

        if admin != stored_admin {
            panic!("Unauthorized: only admin can verify reports");
        }
        admin.require_auth();

        let mut report: SecurityReport = env
            .storage()
            .persistent()
            .get(&DataKey::Report(target.clone()))
            .expect("No report found for this address");

        report.verified = true;

        env.storage()
            .persistent()
            .set(&DataKey::Report(target.clone()), &report);

        env.events().publish(
            (symbol_short!("verify"), target),
            (admin,),
        );
    }

    /// Admin: Update the minimum reports needed to auto-flag an address
    pub fn set_min_reports(env: Env, admin: Address, min_reports: u32) {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Not initialized");

        if admin != stored_admin {
            panic!("Unauthorized");
        }
        admin.require_auth();

        env.storage()
            .instance()
            .set(&DataKey::MinReportsForFlag, &min_reports);
    }

    /// Get total number of reports in the registry
    pub fn get_total_reports(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalReports)
            .unwrap_or(0)
    }

    /// Batch check multiple addresses - returns risk scores
    pub fn batch_check(env: Env, targets: Vec<Address>) -> Vec<u32> {
        let mut scores = vec![&env];
        for target in targets.iter() {
            let score = Self::get_risk_score(env.clone(), target);
            scores.push_back(score);
        }
        scores
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SecurityRegistry);
        let client = SecurityRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);

        assert_eq!(client.get_total_reports(), 0);
    }

    #[test]
    fn test_report_and_check() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, SecurityRegistry);
        let client = SecurityRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let reporter = Address::generate(&env);
        let target = Address::generate(&env);

        client.initialize(&admin);

        let report = client.report_address(
            &reporter,
            &target,
            &ThreatLevel::High,
            &75,
            &symbol_short!("phishing"),
        );

        assert_eq!(report.score, 75);
        assert_eq!(report.report_count, 1);
        assert_eq!(report.threat_level, ThreatLevel::High);

        let checked = client.check_address(&target);
        assert_eq!(checked.score, 75);

        assert_eq!(client.get_risk_score(&target), 75);
        assert!(client.is_flagged(&target)); // High threat = auto-flagged
    }

    #[test]
    fn test_unflagged_safe_address() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SecurityRegistry);
        let client = SecurityRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let unknown = Address::generate(&env);

        client.initialize(&admin);

        assert_eq!(client.get_risk_score(&unknown), 0);
        assert!(!client.is_flagged(&unknown));
    }
}
