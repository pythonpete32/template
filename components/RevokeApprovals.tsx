"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Check, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { Checkbox } from "@/components/ui/checkbox";

// Types
interface TokenApproval {
  id: string;
  contractName: string;
  contractAddress: string;
  tokenSymbol: string;
  tokenIcon: string;
  tokenAddress: string;
  allowance: string;
  isUnlimited: boolean;
}

// Sample approval data (would be fetched from blockchain in a real app)
const SAMPLE_APPROVALS: TokenApproval[] = [
  {
    id: "approval1",
    contractName: "Uniswap V3",
    contractAddress: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    tokenSymbol: "ETH",
    tokenIcon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    allowance: "5",
    isUnlimited: false,
  },
  {
    id: "approval2",
    contractName: "SushiSwap",
    contractAddress: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    tokenSymbol: "USDC",
    tokenIcon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    allowance: "1000",
    isUnlimited: false,
  },
  {
    id: "approval3",
    contractName: "Aave V3",
    contractAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
    tokenSymbol: "USDT",
    tokenIcon: "https://cryptologos.cc/logos/tether-usdt-logo.png",
    tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    allowance: "0",
    isUnlimited: true,
  },
  {
    id: "approval4",
    contractName: "1inch Router",
    contractAddress: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
    tokenSymbol: "WBTC",
    tokenIcon: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
    tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    allowance: "0",
    isUnlimited: true,
  },
  {
    id: "approval5",
    contractName: "PancakeSwap",
    contractAddress: "0xEfF92A263d31888d860bD50809A8D171709b7b1c",
    tokenSymbol: "LINK",
    tokenIcon: "https://cryptologos.cc/logos/chainlink-link-logo.png",
    tokenAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    allowance: "75",
    isUnlimited: false,
  },
  {
    id: "approval6",
    contractName: "Curve Finance",
    contractAddress: "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46",
    tokenSymbol: "DAI",
    tokenIcon: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
    tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    allowance: "2500",
    isUnlimited: false,
  },
  {
    id: "approval7",
    contractName: "Balancer V2",
    contractAddress: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    tokenSymbol: "UNI",
    tokenIcon: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    allowance: "150",
    isUnlimited: false,
  },
  {
    id: "approval8",
    contractName: "Compound",
    contractAddress: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B",
    tokenSymbol: "AAVE",
    tokenIcon: "https://cryptologos.cc/logos/aave-aave-logo.png",
    tokenAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    allowance: "0",
    isUnlimited: true,
  },
  {
    id: "approval9",
    contractName: "ParaSwap",
    contractAddress: "0x1bD435F3C054b6e901B7b108a0ab7617C808677b",
    tokenSymbol: "SNX",
    tokenIcon:
      "https://cryptologos.cc/logos/synthetix-network-token-snx-logo.png",
    tokenAddress: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
    allowance: "420",
    isUnlimited: false,
  },
  {
    id: "approval10",
    contractName: "dYdX",
    contractAddress: "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e",
    tokenSymbol: "CRV",
    tokenIcon: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.png",
    tokenAddress: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    allowance: "0",
    isUnlimited: true,
  },
  {
    id: "approval11",
    contractName: "GMX",
    contractAddress: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    tokenSymbol: "COMP",
    tokenIcon: "https://cryptologos.cc/logos/compound-comp-logo.png",
    tokenAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    allowance: "50",
    isUnlimited: false,
  },
  {
    id: "approval12",
    contractName: "Yearn Finance",
    contractAddress: "0x9D25057e62939D3408406975aD75Ffe834DA4cDd",
    tokenSymbol: "MKR",
    tokenIcon: "https://cryptologos.cc/logos/maker-mkr-logo.png",
    tokenAddress: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
    allowance: "0",
    isUnlimited: true,
  },
  {
    id: "approval13",
    contractName: "Optimism Bridge",
    contractAddress: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
    tokenSymbol: "SUSHI",
    tokenIcon: "https://cryptologos.cc/logos/sushiswap-sushi-logo.png",
    tokenAddress: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
    allowance: "200",
    isUnlimited: false,
  },
  {
    id: "approval14",
    contractName: "Polygon Bridge",
    contractAddress: "0xA0c68C638235ee32657e8f720a23ceC1bFc77C77",
    tokenSymbol: "MATIC",
    tokenIcon: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    tokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    allowance: "750",
    isUnlimited: false,
  },
  {
    id: "approval15",
    contractName: "Convex Finance",
    contractAddress: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31",
    tokenSymbol: "CVX",
    tokenIcon: "https://cryptologos.cc/logos/convex-finance-cvx-logo.png",
    tokenAddress: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
    allowance: "0",
    isUnlimited: true,
  },
];

// Custom Table components
const CustomTable = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full border-collapse">{children}</table>
);

const CustomTableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-muted/30">{children}</thead>
);

const CustomTableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

const CustomTableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b hover:bg-muted/20 transition-colors">{children}</tr>
);

const CustomTableHead = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <th className={`py-3 px-4 font-medium text-sm ${className || ""}`}>
    {children}
  </th>
);

const CustomTableCell = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <td className={`py-3.5 px-4 ${className || ""}`}>{children}</td>;

// SelectAllCheckbox component
const SelectAllCheckbox = ({
  approvals,
  selectedApprovals,
  onChange,
}: {
  approvals: TokenApproval[];
  selectedApprovals: Record<string, boolean>;
  onChange: (selected: Record<string, boolean>) => void;
}) => {
  const allSelected =
    Object.keys(selectedApprovals).length === approvals.length &&
    approvals.length > 0;

  const isIndeterminate =
    Object.keys(selectedApprovals).length > 0 &&
    Object.keys(selectedApprovals).length < approvals.length;

  const handleToggle = () => {
    if (allSelected) {
      // Deselect all
      onChange({});
    } else {
      // Select all
      const allSelected: Record<string, boolean> = {};
      approvals.forEach((approval) => {
        allSelected[approval.id] = true;
      });
      onChange(allSelected);
    }
  };

  return (
    <Checkbox
      checked={allSelected}
      // Using data attribute instead of indeterminate prop
      data-state={
        isIndeterminate
          ? "indeterminate"
          : allSelected
            ? "checked"
            : "unchecked"
      }
      onCheckedChange={handleToggle}
      aria-label="Select all approvals"
    />
  );
};

// ApprovalRow component
const ApprovalRow = ({
  approval,
  selected,
  onChange,
}: {
  approval: TokenApproval;
  selected: boolean;
  onChange: (selected: boolean) => void;
}) => {
  return (
    <CustomTableRow>
      <CustomTableCell className="w-12">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onChange(!!checked)}
          aria-label={`Select ${approval.contractName} approval for ${approval.tokenSymbol}`}
        />
      </CustomTableCell>
      <CustomTableCell>
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[200px]">
            {approval.contractName}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {approval.contractAddress.slice(0, 6)}...
            {approval.contractAddress.slice(-4)}
          </span>
        </div>
      </CustomTableCell>
      <CustomTableCell>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border bg-white flex items-center justify-center">
            {approval.tokenIcon ? (
              <img
                src={approval.tokenIcon}
                alt={approval.tokenSymbol}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="font-medium text-gray-700">
                {approval.tokenSymbol.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{approval.tokenSymbol}</span>
            <span className="text-xs text-muted-foreground">
              {getTokenName(approval.tokenSymbol)}
            </span>
          </div>
        </div>
      </CustomTableCell>
      <CustomTableCell className="text-right">
        {approval.isUnlimited ? (
          <span className="text-lg">∞</span>
        ) : (
          approval.allowance
        )}
      </CustomTableCell>
    </CustomTableRow>
  );
};

// ApprovalTable component
const ApprovalTable = ({
  approvals,
  selectedApprovals,
  onSelectApproval,
  onSelectAll,
}: {
  approvals: TokenApproval[];
  selectedApprovals: Record<string, boolean>;
  onSelectApproval: (id: string, selected: boolean) => void;
  onSelectAll: (selected: Record<string, boolean>) => void;
}) => {
  return (
    <div>
      <CustomTable>
        <CustomTableBody>
          {approvals.map((approval) => (
            <ApprovalRow
              key={approval.id}
              approval={approval}
              selected={!!selectedApprovals[approval.id]}
              onChange={(selected) => onSelectApproval(approval.id, selected)}
            />
          ))}
        </CustomTableBody>
      </CustomTable>
    </div>
  );
};

// ConfirmationModal component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isRevokeAll,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isRevokeAll: boolean;
  isLoading: boolean;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRevokeAll
              ? "Revoke All Approvals"
              : `Revoke ${selectedCount} Selected Approval${
                  selectedCount !== 1 ? "s" : ""
                }`}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {isRevokeAll
                ? "You are about to revoke ALL token approvals. This action will reset allowances to zero for all approved contracts."
                : `You are about to revoke ${selectedCount} selected token approval${
                    selectedCount !== 1 ? "s" : ""
                  }. This action will reset allowances to zero for the selected contracts.`}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mb-4">
            This will require a transaction to be signed and will incur gas
            fees. Are you sure you want to continue?
          </p>
        </div>
        <DialogFooter className="flex sm:justify-end gap-2">
          <Button variant="neutral" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
              </>
            ) : (
              "Confirm Revoke"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// RevokeButtons component
const RevokeButtons = ({
  selectedCount,
  onRevokeSelected,
  disabled,
}: {
  selectedCount: number;
  onRevokeSelected: () => void;
  disabled: boolean;
}) => {
  return (
    <div className="mt-6 max-w-3xl mx-auto">
      <Button
        onClick={onRevokeSelected}
        disabled={selectedCount === 0 || disabled}
        className="w-full py-5 text-base font-medium"
      >
        Revoke Selected ({selectedCount})
      </Button>
    </div>
  );
};

// Helper function to get token name
const getTokenName = (symbol: string): string => {
  const tokenNames: Record<string, string> = {
    ETH: "Ethereum",
    USDC: "USD Coin",
    USDT: "Tether USD",
    WBTC: "Wrapped Bitcoin",
    LINK: "Chainlink",
    DAI: "Dai Stablecoin",
    UNI: "Uniswap",
    AAVE: "Aave Token",
    CRV: "Curve DAO",
    COMP: "Compound",
    MKR: "Maker",
    SNX: "Synthetix",
    SUSHI: "SushiSwap",
  };

  return tokenNames[symbol] || symbol;
};

// Main RevokeApprovals Component
export default function RevokeApprovals() {
  // States
  const [loading, setLoading] = useState(true);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<TokenApproval[]>([]);
  const [selectedApprovals, setSelectedApprovals] = useState<
    Record<string, boolean>
  >({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isRevokeAll, setIsRevokeAll] = useState(false);

  // Load approvals (simulated)
  useEffect(() => {
    const loadApprovals = async () => {
      try {
        // In a real app, this would be an API call to fetch user's token approvals
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setApprovals(SAMPLE_APPROVALS);
        setLoading(false);
      } catch (error) {
        setError("Failed to load token approvals. Please try again.");
        setLoading(false);
      }
    };

    loadApprovals();
  }, []);

  // Handle single approval selection
  const handleSelectApproval = (id: string, selected: boolean) => {
    setSelectedApprovals((prev) => {
      if (selected) {
        return { ...prev, [id]: true };
      }

      // Using destructuring to omit a key from an object
      const newSelectedApprovals = { ...prev };
      delete newSelectedApprovals[id];
      return newSelectedApprovals;
    });
  };

  // Handle select all approvals
  const handleSelectAll = (selected: Record<string, boolean>) => {
    setSelectedApprovals(selected);
  };

  // Handle revoke selected
  const handleRevokeSelected = () => {
    setIsRevokeAll(false);
    setShowConfirmDialog(true);
  };

  // Handle revoke all
  const handleRevokeAll = () => {
    setIsRevokeAll(true);
    setShowConfirmDialog(true);
  };

  // Execute revocation
  const executeRevoke = async () => {
    setRevokeLoading(true);

    try {
      // In a real app, this would call blockchain methods to revoke approvals
      console.log(
        "Revoking approvals:",
        isRevokeAll
          ? approvals
          : approvals.filter((approval) => selectedApprovals[approval.id])
      );

      // Simulate transaction processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update approvals list after successful revocation
      if (isRevokeAll) {
        setApprovals([]);
      } else {
        setApprovals(
          approvals.filter((approval) => !selectedApprovals[approval.id])
        );
      }

      // Clear selections after successful revocation
      setSelectedApprovals({});
      setShowConfirmDialog(false);
      setRevokeLoading(false);
    } catch (error) {
      setError("Failed to revoke approvals. Please try again.");
      setShowConfirmDialog(false);
      setRevokeLoading(false);
    }
  };

  // Selected approvals count
  const selectedCount = Object.keys(selectedApprovals).length;

  // Render loading state
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg font-medium">Loading your approvals...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          className="mt-4 w-full"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Render empty state
  if (approvals.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 text-center">
        <div className="py-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-secondary-background flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No active approvals</h3>
          <p className="text-muted-foreground mb-6">
            You have not granted any token spend allowances
          </p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Token Approvals</h2>
        <p className="text-muted-foreground">
          Manage and revoke token spend permissions you&apos;ve granted to
          contracts
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Active Approvals</h3>
          <Badge variant="neutral">{approvals.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="neutral"
            size="sm"
            onClick={() => {
              // Select all approvals
              const allSelected: Record<string, boolean> = {};
              for (const approval of approvals) {
                allSelected[approval.id] = true;
              }
              setSelectedApprovals(allSelected);
            }}
          >
            Select All
          </Button>
          <Button
            variant="neutral"
            size="sm"
            onClick={() => setSelectedApprovals({})}
          >
            Clear Selection
          </Button>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto overflow-hidden">
        <ScrollArea className="h-[360px]" type="always">
          <div className="pr-4">
            <ApprovalTable
              approvals={approvals}
              selectedApprovals={selectedApprovals}
              onSelectApproval={handleSelectApproval}
              onSelectAll={handleSelectAll}
            />
          </div>
        </ScrollArea>
      </Card>

      <RevokeButtons
        selectedCount={selectedCount}
        onRevokeSelected={handleRevokeSelected}
        disabled={revokeLoading}
      />

      <ConfirmationModal
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={executeRevoke}
        selectedCount={selectedCount}
        isRevokeAll={isRevokeAll}
        isLoading={revokeLoading}
      />
    </div>
  );
}
