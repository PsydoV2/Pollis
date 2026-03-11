// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

struct Poll {
    uint pollID;
    string question;
    uint votesYes;
    uint votesNo;
    address creator;
    uint endsAt;
    bool isPrivate;
}

contract Pollis {
    mapping(uint => mapping(address => bool)) public hasVoted;
    Poll[] public polls;

    event Vote(uint pollID, address voter, bool voteYes);

    constructor() {
    }

    event PollCreated(uint pollID, address creator, bool isPrivate);

    function createPoll(string calldata question, uint duration, bool isPrivate) public {
        uint newId = polls.length;
        polls.push(Poll({
            pollID: newId,
            question: question,
            votesYes: 0,
            votesNo: 0,
            creator: msg.sender,
            endsAt: block.timestamp + duration,
            isPrivate: isPrivate
        }));

        emit PollCreated(newId, msg.sender, isPrivate);
    }

    function vote(uint pollID, bool voteYes) public {
        require(pollID < polls.length, "Poll does not exist!");
        
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
        require(pollID < polls.length, "Poll does not exist!");

        return polls[pollID];
    }

    function getPollCount() public view returns (uint) {
        return polls.length;
    }
}