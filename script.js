'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2022-06-14T12:21:21.045Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2022-06-10T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2022-06-12T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const Loginbtn = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/*IMPLEMENTING THE LOGIN */
let currentUser;
setAllUsernames(accounts);

function createUsername(account) {
  let userName = account.owner.split(' ');
  let userID = userName.reduce((acc, word) => (acc += word[0]), '');
  account.userName ??= userID;
}

function setAllUsernames(accounts) {
  for (const account of accounts) {
    createUsername(account);
    account.balance = +account.movements.reduce(
      (acc, bills, _i) => acc + bills,
      0
    );
  }
  console.log(`all usernames initialized`);
}

function checkUsername(username, password, accountFile) {
  for (const account of Object.values(accountFile)) {
    let { userName: acc, pin } = account;
    if (acc === username.toUpperCase() && Number(password) === pin) {
      currentUser = account; //if the username exixts then initialize the current user. else pass
      containerApp.style.opacity = 100;
      labelWelcome.textContent = `Welcome Back ${
        currentUser.owner.split(' ')[0]
      }`;
      return currentUser;
    }
  }
  currentUser || alert('Wrong Username or Password 😂😂😂');
}

function daysPassed(day1, day2) {
  return Math.floor(
    Math.abs((new Date(day1).getTime() - new Date(day2).getTime()) / 86400000)
  );
}
function setNumberOptions() {
  let option = {
    style: 'currency',
    currency: currentUser.currency,
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  };
  let locale = currentUser.locale;
  return [locale, option];
}
function displayMovements(movements) {
  const now = new Date();
  let day;
  if (movements) {
    containerMovements.innerHTML = '';
    for (const [i, bill] of movements.entries()) {
      let type = bill < 0 ? 'withdrawal' : 'deposit';
      if (daysPassed(now, currentUser.movementsDates[i]) === 0) {
        day = 'Today';
      } else if (daysPassed(now, currentUser.movementsDates[i]) === 1) {
        day = 'Yesterday';
      } else if (daysPassed(now, currentUser.movementsDates[i]) <= 7) {
        day = `${daysPassed(now, currentUser.movementsDates[i])} Days ago`;
      } else {
        day = `${(
          new Date(currentUser.movementsDates[i]).getDate() + ''
        ).padStart(2, 0)}/${(
          new Date(currentUser.movementsDates[i]).getMonth() +
          1 +
          ''
        ).padStart(2, 0)}/${new Date(
          currentUser.movementsDates[i]
        ).getFullYear()}`;
      }
      let euroMovements = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">
    ${i + 1} ${type}
    </div>
     <div class="movements__date">${day} </div>
    <div class="movements__value">${Intl.NumberFormat(
      ...setNumberOptions()
    ).format(Math.abs(bill))}</div>
    </div>`;
      containerMovements.insertAdjacentHTML('afterbegin', euroMovements);
    }
  }
}

let timing;
function startLogoutTimer(future = 300_000) {
  const tick = function () {
    let [_hr, mins, sec] = getTimer(future);
    labelTimer.textContent = `${(mins + '').padStart(2, 0)}:${(
      sec + ''
    ).padStart(2, 0)}`;
    future -= 1_000;
    if (future <= -1) {
      clearInterval(timing);
      containerApp.style.opacity = 0;
      currentUser = undefined;
      labelWelcome.textContent = `Login to get Started`;
    }
  };

  tick();
  const timing = setInterval(tick, 1_000);
  return timing;
}
function resetTimeout() {
  clearInterval(timing);
  timing = startLogoutTimer();
}
Loginbtn.addEventListener('click', function (e) {
  e.preventDefault();

  if (currentUser === undefined) {
    checkUsername(inputLoginUsername.value, inputLoginPin.value, accounts);
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    if (currentUser) {
      timing = startLogoutTimer();

      currentUser && console.log(currentUser);
      displayMovements(currentUser.movements);
      displayBalance(currentUser.movements);

      let minVal = currentUser.movements.reduce(
        (acc, bill, _i) => (acc = acc < bill ? acc : bill),
        currentUser.movements[0]
      );

      displayTotals();
      const now = new Date();
      labelDate.textContent = `Today ${new Intl.DateTimeFormat(
        ...setNumberOptions()
      ).format(now)}`;
    }
  } else if (currentUser) {
    alert(`A user is already logged in`);
  }
});

//////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

/* Implementing the sort button*/
let direction = 0;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  containerMovements.innerHTML = '';
  if (direction === 0) {
    // console.log(direction);
    let sortedMovements = currentUser.movements.sort(function (a, b) {
      return a - b;
    });
    displayMovements(sortedMovements);
    direction = 1;
  } else if (direction !== 0) {
    // console.log('else', direction);
    let sortedMovements = currentUser.movements.sort(function (a, b) {
      return b - a;
    });
    displayMovements(sortedMovements);
    direction = 0;
  }
  resetTimeout();
});

/*Implementing the transfer function*/
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  // console.log();
  if (findUser(inputTransferTo.value)) {
    transferMoney(
      inputTransferAmount.value,
      currentUser.userName,
      inputTransferTo.value
    );
    displayBalance(currentUser.movements);
    displayMovements(currentUser.movements);
    inputTransferAmount.value = inputTransferTo.value = '';
    inputTransferTo.blur();
    displayTotals();
  } else {
    alert(`Wrong UserName🚫🚫`);
  }
  resetTimeout();
});

/*Implementing the Loan button */
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  let maxVal = currentUser?.movements.reduce(
    (acc, bill, _i) => (acc = acc > bill ? acc : bill),
    currentUser.movements[0]
  );
  if (
    Number(inputLoanAmount.value) > 0 &&
    currentUser.movements.some(
      bill => bill >= Number(inputLoanAmount.value) * 0.1
    )
  ) {
    alert(`Your Loan of ${inputLoanAmount.value} is being processed`);
    depositMoney(Math.floor(inputLoanAmount.value), currentUser.userName);
    setTimeout(function () {
      displayBalance(currentUser.movements);
      displayMovements(currentUser.movements);
    }, 3000);
  } else if (Number(inputLoanAmount.value) <= 0) {
    alert(
      `We can't loan you ${inputLoanAmount.value}€, Try a number greater than zero`
    );
  } else if (
    !currentUser.movements.some(
      bill => bill >= Number(inputLoanAmount.value) * 0.1
    )
  ) {
    alert(
      `We can't loan you ${
        inputLoanAmount.value
      }, The maximium value we can loan you is ${maxVal * 10} `
    );
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
  displayTotals();
  resetTimeout();
});

/*Implementing the delete user button */
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentUser?.userName === inputCloseUsername.value.toUpperCase() &&
    currentUser?.pin === Number(inputClosePin.value)
  ) {
    let index = accounts.findIndex(
      account => account.userName === currentUser.userName
    );
    inputCloseUsername.value = inputClosePin.value = '';
    if (index !== -1) {
      accounts.splice(index, 1);
      containerApp.style.opacity = 0;
      currentUser = undefined;
    }
  } else {
    inputCloseUsername.value = inputClosePin.value = '';
    console.log('something wrong');
  }
});
//////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
function depositMoney(amount, toUser) {
  let _toUser = findUser(toUser);
  if (_toUser) {
    _toUser.movements.push(+amount);
    _toUser.movementsDates.push(new Date().toISOString());
    _toUser.balance += +amount;
  }
}

function withdrawMoney(amount, fromUser) {
  if (+amount < +currentUser.balance && amount > 0) {
    let _fromUser = findUser(fromUser);
    _fromUser.movements.push(+-amount);
    _fromUser.movementsDates.push(new Date().toISOString());
    currentUser.balance -= +amount;
  } else {
    alert(`Insuficient Balance`);
  }
}

function transferMoney(amount, fromUser, toUser) {
  if (fromUser !== toUser) {
    withdrawMoney(amount, fromUser);
    depositMoney(amount, toUser);
  } else {
    alert(`You can't deposit to yourself`);
  }
}
function calculateTotalDepositsInUSD(bills) {
  let bill = bills
    .filter(mov => mov > 0)
    .map(mov => mov * euro2dollars)
    .reduce((acc, mov) => acc + mov, 0);
  return bill;
}

function setupAccount(movements) {
  const dollarBills = movements.map(bills => Math.trunc(bills * euro2dollars));
  const withdrawals = dollarBills.filter(bills => bills < 0);
  const deposits = dollarBills.filter(bills => bills > 0);
  const dollarBalance = dollarBills.reduce((acc, bills, _i) => acc + bills, 0);
  return { dollarBills, withdrawals, deposits, dollarBalance };
}

function displayBalance(movements) {
  currentUser.balance = movements.reduce(
    (accumulator, bills) => accumulator + bills,
    0
  );

  labelBalance.textContent = Intl.NumberFormat(...setNumberOptions()).format(
    currentUser.balance
  );
}
const euro2dollars = 1.13;

function calculateTotalWithdrawalsInUSD(bills) {
  let bill = bills
    .filter(mov => mov < 0)
    // .map(mov => mov * euro2dollars)
    .reduce((acc, mov) => acc + mov, 0)
    .toFixed(2);
  return bill;
}

function displayTotals() {
  labelSumIn.textContent = Intl.NumberFormat(...setNumberOptions()).format(
    calculateTotalDepositsInUSD(currentUser.movements).toFixed(2)
  );
  labelSumOut.textContent = Intl.NumberFormat(...setNumberOptions()).format(
    Math.abs(calculateTotalWithdrawalsInUSD(currentUser.movements)).toFixed(2)
  );
  let _x;
  labelSumInterest.textContent = Intl.NumberFormat(
    ...setNumberOptions()
  ).format(
    (
      (calculateTotalDepositsInUSD(currentUser.movements) *
        currentUser.interestRate) /
      100
    ).toFixed(2)
  );
}

function checkNewUsername(username, accountFile) {
  for (const account of Object.values(accountFile)) {
    let { owner: acc } = account;
    acc === username && alert(`username already exists`);
  }
}
function findUser(userName) {
  return accounts.find(account => account.userName === userName.toUpperCase());
}

function getTimer(timeStamp) {
  let hour = parseInt(timeStamp / 1000 / 3600);
  let minute = parseInt(((timeStamp / 1000) % 3600) / 60);
  let second = parseInt(((timeStamp / 1000) % 3600) % 60);

  return [hour, minute, second];
}
