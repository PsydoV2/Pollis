// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

// Gas-optimised struct: fields ordered for tight slot packing.
// Slot 0: creator (20 bytes) + isUnlisted (1 byte) + endsAt (8 bytes) = 29 bytes
// Slot 1: pollID (4 bytes) + votesYes (12 bytes) + votesNo (12 bytes) = 28 bytes
// Slot 2+: question (dynamic string)
struct Poll {
    address creator;
    bool isUnlisted;
    uint64 endsAt;
    uint32 pollID;
    uint96 votesYes;
    uint96 votesNo;
    string question;
}

contract Pollis {
    mapping(uint => mapping(address => bool)) public hasVoted;
    mapping(uint => Poll) public polls;
    uint public pollCount;

    event Vote(uint pollID, address voter, bool voteYes);
    event PollCreated(uint pollID, address creator, bool isUnlisted);

    constructor() {}

    function createPoll(string calldata question, uint duration, bool isUnlisted) public {
        require(bytes(question).length > 0, "Question cannot be empty");
        require(bytes(question).length <= 200, "Question too long");
        require(duration >= 3600, "Minimum duration is 1 hour");
        require(duration <= 2592000, "Maximum duration is 30 days");

        uint newId = pollCount;
        polls[newId] = Poll({
            pollID: uint32(newId),
            question: question,
            votesYes: 0,
            votesNo: 0,
            creator: msg.sender,
            endsAt: uint64(block.timestamp + duration),
            isUnlisted: isUnlisted
        });
        pollCount++;

        emit PollCreated(newId, msg.sender, isUnlisted);
    }

    function vote(uint pollID, bool voteYes) public {
        require(pollID < pollCount, "Poll does not exist!");

        Poll storage poll = polls[pollID];

        require(block.timestamp < poll.endsAt, "Poll has ended!");
        require(!hasVoted[pollID][msg.sender], "You can only vote once!");

        if (voteYes) {
            poll.votesYes++;
        } else {
            poll.votesNo++;
        }

        emit Vote(pollID, msg.sender, voteYes);

        hasVoted[pollID][msg.sender] = true;
    }

    function getPoll(uint pollID) public view returns (Poll memory) {
        require(pollID < pollCount, "Poll does not exist!");
        return polls[pollID];
    }

    function getPollCount() public view returns (uint) {
        return pollCount;
    }

    function getPollsBatch(uint from, uint count) public view returns (Poll[] memory) {
        uint end = from + count;
        if (end > pollCount) end = pollCount;
        Poll[] memory result = new Poll[](end - from);
        for (uint i = from; i < end; i++) {
            result[i - from] = polls[i];
        }
        return result;
    }
}
