export const products = [
  { id: 'phone-1', brand: 'Acer', model: 'Liquid Z6', price: '120', imgUrl: 'https://example.com/phone.jpg' },
  { id: 'phone-2', brand: 'Alcatel', model: 'Idol 4', price: '', imgUrl: 'https://example.com/phone2.jpg' },
];

export const detail = {
  ...products[0], cpu: 'Quad-core', ram: '2 GB RAM', os: 'Android', displaySize: '720 x 1280 pixels',
  displayResolution: '5 inches', battery: '3000 mAh', primaryCamera: ['13 MP', 'autofocus'],
  secondaryCmera: ['5 MP'], dimentions: '150 x 75 x 8 mm', weight: '150',
  options: {
    colors: [{ code: 1000, name: 'Black' }],
    storages: [{ code: 2000, name: '16 GB' }, { code: 2001, name: '32 GB' }],
  },
};
