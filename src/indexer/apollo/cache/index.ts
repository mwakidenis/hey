import { InMemoryCache } from '@apollo/client';
import result from '../../possible-types';
import createCursorFieldPolicy from './createCursorFieldPolicy';

const cache = new InMemoryCache({
  possibleTypes: result.possibleTypes,
  typePolicies: {
    Account: { keyFields: ["address"] },
    AccountManager: { keyFields: ["manager"] },
    Group: { keyFields: ["address"] },
    Query: {
      fields: {
        accountsAvailable: createCursorFieldPolicy([
          "request",
          ["hiddenFilter", "includeOwned", "managedBy", "pageSize"]
        ]),
        accountsBlocked: createCursorFieldPolicy([
          "request",
          ["filter", "pageSize"]
        ]),
        accountManagers: createCursorFieldPolicy([
          "request",
          ["filter", "pageSize"]
        ]),
        accounts: createCursorFieldPolicy(["request", ["filter", "orderBy"]]),
        adminsFor: createCursorFieldPolicy(["request", ["address"]]),
        authenticatedSessions: createCursorFieldPolicy([
          "request",
          ["filter", "pageSize"]
        ]),
        followers: createCursorFieldPolicy(["request", ["account"]]),
        followersYouKnow: createCursorFieldPolicy([
          "request",
          ["filter", "observer", "orderBy", "pageSize", "target"]
        ]),
        following: createCursorFieldPolicy(["request", ["account"]]),
        groupBannedAccounts: createCursorFieldPolicy([
          "request",
          ["group", "orderBy", "pageSize"]
        ]),
        groupMembers: createCursorFieldPolicy(["request", ["group"]]),
        groupMembershipRequests: createCursorFieldPolicy([
          "request",
          ["group", "orderBy", "pageSize"]
        ]),
        groups: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        mlPostsExplore: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        mlPostsForYou: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        notifications: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        postBookmarks: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        postReactions: createCursorFieldPolicy(["request", ["post"]]),
        postReferences: createCursorFieldPolicy([
          "request",
          [
            "referencedPost",
            "referenceTypes",
            "relevancyFilter",
            "visibilityFilter"
          ]
        ]),
        posts: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        timeline: createCursorFieldPolicy(["request", ["account"]]),
        timelineHighlights: createCursorFieldPolicy(["request", ["account"]]),
        tokenDistributions: createCursorFieldPolicy(["request", ["pageSize"]]),
        usernames: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        whoExecutedActionOnPost: createCursorFieldPolicy([
          "request",
          ["filter", "orderBy", "pageSize", "post"]
        ]),
        whoReferencedPost: createCursorFieldPolicy([
          "request",
          ["post", "referenceTypes"]
        ])
      }
    }
  }
});

export default cache;
