// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface ITicketFactory {
    function createTicket(
        bytes32 _identifier,
        address _msgSender,
        bytes memory _message
    ) external;
}

contract TokenBridge {
    address appInbox;

    constructor(address _appInbox) {
        appInbox = _appInbox;
    }

    function bridgeETH(address _to) external payable {
        require(_to != address(0), "bridgeTokens/zero-address");
        require(msg.value > 0, "bridgeTokens/zero-amount");

        bytes memory message = abi.encode(_to, msg.value);
        bytes32 identifier = keccak256("BRIDGE_ETH");

        ITicketFactory(appInbox).createTicket(identifier, msg.sender, message);
    }
}
