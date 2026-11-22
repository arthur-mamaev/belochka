(() => {
  const get = id => document.getElementById(id);
  const form = get('booking-form');
  const submitButton = form.querySelector('button');
  const payButton = get('demo-pay');
  const participant = {
    parent: 'Анна Сергеевна Примерова',
    child: 'Михаил Андреевич Примеров',
    shift: 'Летняя смена (демо)',
    amount: '37 800 ₽',
  };
  let booking;
  let sequence = 0;
  const session = Array.from(crypto.getRandomValues(new Uint32Array(2)),
    value => value.toString(16).padStart(8, '0')).join('').toUpperCase();

  function addRecord(registry, text) {
    const list = get(registry + '-list');
    const entry = document.createElement('li');
    entry.textContent = text;
    list.append(entry);
    list.hidden = false;
    get(registry + '-empty').hidden = true;
  }

  function download(title, number, references = []) {
    const lines = [
      'ДЕМО · ДОЛ «Белочка» · Вымышленные данные',
      title + ' № ' + number,
      'Дата оформления: ' + booking.createdAt,
      'Родитель: ' + participant.parent,
      'Ребёнок: ' + participant.child,
      'Смена: ' + participant.shift,
      'Стоимость: ' + participant.amount,
      ...references,
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = number + '.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (booking) return;

    const key = session + '-' + (++sequence);
    const createdAt = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Kirov' });
    booking = { key, contract: 'Д-' + key, createdAt };
    submitButton.disabled = true;
    get('booking-contract').hidden = false;
    get('booking-payment').hidden = false;
    get('booking-contract-number').textContent = '№ ' + booking.contract;
    get('booking-payment-status').textContent = 'Ожидает оплаты · ' + participant.amount;
    addRecord('contracts', '№ ' + booking.contract + ' · ' + participant.parent + ' · ' + participant.child + ' · ' + createdAt);
    get('booking-announcement').textContent = 'Договор сформирован. Его можно скачать и перейти к оплате.';
    get('download-contract').focus();
  });

  payButton.addEventListener('click', () => {
    if (!booking || booking.payment) return;

    booking.payment = 'О-' + booking.key;
    booking.voucher = 'П-' + booking.key;
    booking.paidAt = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Kirov' });
    payButton.disabled = true;
    get('booking-payment-status').textContent = 'Демооплата прошла · ' + participant.amount + ' · № ' + booking.payment;
    addRecord('payments', '№ ' + booking.payment + ' · Договор № ' + booking.contract + ' · ' + participant.amount + ' · Оплачено (демо) · ' + booking.paidAt);
    addRecord('vouchers', '№ ' + booking.voucher + ' · Договор № ' + booking.contract + ' · Оплата № ' + booking.payment + ' · ' + booking.paidAt);
    get('booking-voucher-number').textContent = '№ ' + booking.voucher;
    get('booking-voucher').hidden = false;
    get('booking-announcement').textContent = 'Демооплата подтверждена. Путёвка выдана.';
    get('download-voucher').focus();
  });

  get('download-contract').addEventListener('click', () => {
    if (booking) download('Персональный договор', booking.contract);
  });

  get('download-voucher').addEventListener('click', () => {
    if (booking?.voucher) download('Путёвка', booking.voucher, [
      'Договор № ' + booking.contract,
      'Демооплата № ' + booking.payment,
      'Дата выдачи: ' + booking.paidAt,
    ]);
  });

  get('new-booking').addEventListener('click', () => {
    booking = undefined;
    for (const step of ['booking-contract', 'booking-payment', 'booking-voucher']) {
      get(step).hidden = true;
    }
    payButton.disabled = false;
    submitButton.disabled = false;
    get('booking-announcement').textContent = '';
    submitButton.focus();
  });
})();
