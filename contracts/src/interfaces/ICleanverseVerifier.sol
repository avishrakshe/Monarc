// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ICleanverseVerifier
/// @notice Interface for Cleanverse CVI (Cryptographic Verified Identity) verification
interface ICleanverseVerifier {
    function verifyCVI(address agent, bytes calldata proof) external view returns (bool);
}
