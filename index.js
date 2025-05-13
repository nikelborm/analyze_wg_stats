const outputAnonymizedData = process.env.SHOULD_OUTPUT_ANONYMIZED_DATA === 'true';
const monthlyCostOfServer = 400;

console.log('Output anonymized data:', outputAnonymizedData);

/**
 * An array of VPN profiles.
 * @typedef {Object[]} VpnProfile
 * @property {string} id - The unique identifier of the VPN profile.
 * @property {string} name - The name of the VPN profile.
 * @property {boolean} enabled - Whether the VPN profile is enabled or not.
 * @property {string} address - The IP address of the VPN profile.
 * @property {string} publicKey - The public key of the VPN profile.
 * @property {string} createdAt - The date and time when the VPN profile was created.
 * @property {string} updatedAt - The date and time when the VPN profile was last updated.
 * @property {string} persistentKeepalive - The persistent keepalive setting of the VPN profile.
 * @property {string} latestHandshakeAt - The date and time of the latest handshake of the VPN profile.
 * @property {number} transferRx - The amount of data received by the VPN profile.
 * @property {number} transferTx - The amount of data transmitted by the VPN profile.
 */
const allVpnProfiles = require('./allVpnProfiles.json');

/**
 * Groups an array of objects by a specified key.
 *
 * @param {Array} values - The array of objects to group.
 * @param {string|Function} keyFinder - The key to group by. Can be a property name or a function that returns the key.
 * @returns {Object} - An object with keys as the grouped values and values as arrays of objects with that key.
 */
const groupBy = (values, keyFinder) => {
  // using reduce to aggregate values
  return values.reduce((a, b) => {
    // depending upon the type of keyFinder
    // if it is function, pass the value to it
    // if it is a property, access the property
    const key = typeof keyFinder === 'function' ? keyFinder(b) : b[keyFinder];

    // aggregate values based on the keys
    if (!a[key]) {
      a[key] = [b];
    } else {
      a[key] = [...a[key], b];
    }

    return a;
  }, {});
};

/**
 * Rounds a number to two decimal places.
 *
 * @param {number} int - The number to round.
 * @returns {number} The rounded number.
 */
const round = (int) => parseFloat(int.toFixed(2));

/**
 * Logs a table of rounded and sorted columns from an object of info records, using remapped keys for column names.
 * @param {Object} nicknamesToInfoRecords - Object containing info records for each nickname.
 * @param {Object} remappedKeysOfInfoRecordsToRoundAndPrint - Object containing remapped keys for info records to round and print.
 * @param {string} sortingKey - Key to sort the table by.
 * @returns {void}
 */
const logTableAndRoundColumns = (nicknamesToInfoRecords, remappedKeysOfInfoRecordsToRoundAndPrint, sortingKey) => {
  const roundedSortedPrettifiedEntries = Object
    .entries(nicknamesToInfoRecords)
    .toSorted(([, { [sortingKey]: a }], [, { [sortingKey]: b }]) => b - a)
    .map(([nickname, infoRecord]) => [
      nickname,
      Object.fromEntries(
        Object
          .entries(infoRecord)
          .filter(([infoRecordKey]) => infoRecordKey in remappedKeysOfInfoRecordsToRoundAndPrint)
          .map(([infoRecordKey, infoRecordValue]) => [
            remappedKeysOfInfoRecordsToRoundAndPrint[infoRecordKey],
            round(infoRecordValue)
          ])
      )
    ]);

  console.table(Object.fromEntries(roundedSortedPrettifiedEntries))
}

const userNameToAnonymizedUserNameMap = new Map();

let activeVpnProfiles = allVpnProfiles
  .filter((item) => {
    if (item.name.includes('del') === !!item.enabled) {
      throw new Error(`Item ${item.name} has 'del' in name and enabled`);
    }
    if (item.enabled && (item.transferRx === null || item.transferTx === null)) {
      throw new Error(`Item ${item.name} enabled but has null transferRx or transferTx`);
    }
    return item.enabled;
  })
  .map(({
    id,
    name: vpnConfigName,
    enabled,
    createdAt: createdAtDateTimeString,
    transferRx: transferRxBytes,
    transferTx: transferTxBytes,
  }) => {
    const createdAt = new Date(createdAtDateTimeString);
    const profile = {
      id,
      enabled,
      createdAt,
      userName: vpnConfigName.split('-')[0],
      transferRxBytes,
      transferTxBytes,
      vpnConfigName,
      amountOfMonthSinceCreation: ((new Date() - createdAt) / 1000 / 60 / 60 / 24 / 30),
      combinedProfileTransferInGb: (transferRxBytes + transferTxBytes) / 1024 / 1024 / 1024,
    }
    profile.estimatedMonthlyConsumptionInGb = profile.combinedProfileTransferInGb / profile.amountOfMonthSinceCreation;
    profile.estimatedQuarterConsumptionInGb = profile.estimatedMonthlyConsumptionInGb * 3;
    return profile;
  });

if (outputAnonymizedData) {
  activeVpnProfiles = activeVpnProfiles.map((profile) => {
    const { userName } = profile;
    let anonymizedUserName = userNameToAnonymizedUserNameMap.get(userName);
    if (!anonymizedUserName) {
      anonymizedUserName = `User${Math.floor(Math.random() * 10000)}`;
      userNameToAnonymizedUserNameMap.set(userName, anonymizedUserName);
    }
    return {
      ...profile,
      userName: anonymizedUserName,
    };
  });
  // console.log(userNameToAnonymizedUserNameMap);
}

const quarterCostOfServer = monthlyCostOfServer * 3;

const uniqueUserNames = new Set(activeVpnProfiles.map(({ userName }) => userName));
const amountOfUsers = uniqueUserNames.size;
const quarterlyPaymentOfUserWhereEverybodyEqual = round(quarterCostOfServer / amountOfUsers);

/**
 * An object containing information about the total transfer and estimated consumption for each user in a VPN network.
 * @typedef {Object} UsersToTheirTransfers
 * @property {Object} [userName] - An object containing the following properties:
 * @property {number} totalUserTransferInGb - The total transfer in gigabytes for the user.
 * @property {number} estimatedMonthlyConsumptionInGb - The estimated monthly consumption in gigabytes for the user.
 * @property {number} estimatedQuarterConsumptionInGb - The estimated quarterly consumption in gigabytes for the user.
 */

/**
 * Reduces an array of VPN profiles to an object containing information about the total transfer and estimated consumption for each user in the network.
 * @function
 * @param {Array} activeVpnProfiles - An array of VPN profiles.
 * @returns {UsersToTheirTransfers} An object containing information about the total transfer and estimated consumption for each user in the network.
 */
const usersToTheirTransfers = activeVpnProfiles.reduce((acc, {
  userName,
  combinedProfileTransferInGb,
  estimatedMonthlyConsumptionInGb,
  estimatedQuarterConsumptionInGb
}) => {
  if (!acc[userName]) {
    acc[userName] = {
      totalUserTransferInGb: 0,
      estimatedMonthlyConsumptionInGb: 0,
      estimatedQuarterConsumptionInGb: 0,
    };
  }
  acc[userName].totalUserTransferInGb += combinedProfileTransferInGb;
  acc[userName].estimatedMonthlyConsumptionInGb += estimatedMonthlyConsumptionInGb;
  acc[userName].estimatedQuarterConsumptionInGb += estimatedQuarterConsumptionInGb;
  return acc;
}, Object.create(null));

const [totalServerTransfer, totalEstimatedServerTransferInLastQuarter] = Object
  .values(usersToTheirTransfers)
  .reduce(
    ([sumTransfer, sumQuarter], { totalUserTransferInGb, estimatedQuarterConsumptionInGb }) => [
      sumTransfer + totalUserTransferInGb,
      sumQuarter + estimatedQuarterConsumptionInGb,
    ],
    [0, 0],
  );


const usersToTheirRelativeTransfers = Object
  .entries(usersToTheirTransfers)
  .map(([userName, { totalUserTransferInGb, estimatedQuarterConsumptionInGb }]) => [
    userName,
    {
      percentOfTotalServerTransfer: totalUserTransferInGb / totalServerTransfer * 100,
      quarterPaymentIfEverybodyPayEqualBasedOnEntireConsumption: totalUserTransferInGb / totalServerTransfer * quarterCostOfServer,

      percentOfQuarterConsumption: estimatedQuarterConsumptionInGb / totalEstimatedServerTransferInLastQuarter * 100,
      quarterPaymentIfEverybodyPayAccordingToLastQuarterConsumption: estimatedQuarterConsumptionInGb / totalEstimatedServerTransferInLastQuarter * quarterCostOfServer
    }
  ]);

console.log('amount of all vpn profiles: ', allVpnProfiles.length);
console.log('amount of active vpn profiles: ', activeVpnProfiles.length);
console.log('amount of deleted vpn profiles: ', allVpnProfiles.length - activeVpnProfiles.length);
console.log('\nmothly cost of server: ', monthlyCostOfServer);
console.log('quarter cost of server: ', quarterCostOfServer);
console.log('\nCurrent amount of users: ', amountOfUsers);
console.log('Quarterly payment of user where everybody equal: ', quarterlyPaymentOfUserWhereEverybodyEqual);
console.log('\nTotal transfer of all users (PB): ', round(totalServerTransfer / 1024));
console.log('Total estimated transfer of all users in last quarter (PB): ', round(totalEstimatedServerTransferInLastQuarter / 1024));

console.log('\nUsers with their total and last quarter transfers (highest total first):');
logTableAndRoundColumns(
  usersToTheirTransfers,
  {
    'totalUserTransferInGb': 'Total transfer (GB)',
    'estimatedMonthlyConsumptionInGb': 'Monthly transfer (GB)',
    'estimatedQuarterConsumptionInGb': 'Quarterly transfer (GB)',
  },
  'totalUserTransferInGb',
);

console.log('\nUsers in relation to total server transfer (highest percent first):');
logTableAndRoundColumns(
  Object.fromEntries(usersToTheirRelativeTransfers),
  {
    'percentOfTotalServerTransfer': '% of total server transfer',
    'quarterPaymentIfEverybodyPayEqualBasedOnEntireConsumption': 'Quarterly payment based on total transfer (RUB)',
  },
  'percentOfTotalServerTransfer',
);

console.log('\nUsers in relation to estimated last quarter transfer (highest percent first):');
logTableAndRoundColumns(
  Object.fromEntries(usersToTheirRelativeTransfers),
  {
    'percentOfQuarterConsumption': '% of quarter server transfer',
    'quarterPaymentIfEverybodyPayAccordingToLastQuarterConsumption': 'Quarterly payment based on last quarter transfer (RUB)',
  },
  'percentOfQuarterConsumption',
);
