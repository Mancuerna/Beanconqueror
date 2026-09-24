import { Bean } from '../../classes/bean/bean';
import { Brew } from '../../classes/brew/brew';
import { Mill } from '../../classes/mill/mill';
import { ShareBrewTextFields } from '../../classes/parameter/shareBrewTextFields';
import { Preparation } from '../../classes/preparation/preparation';
import { BREW_QUANTITY_TYPES_ENUM } from '../../enums/brews/brewQuantityTypes';

/** Format a brew for chat apps without translating user-entered bean data. */
export function formatBrewShareText(
  brew: Brew,
  bean: Bean,
  preparation: Preparation,
  mill: Mill,
  fields: ShareBrewTextFields,
  translate: (key: string) => string,
  language: string,
): string {
  const lines: string[] = [];
  const formatNumber = new Intl.NumberFormat(
    (language || 'en').replace('_', '-'),
    {
      maximumFractionDigits: 2,
    },
  );
  const add = (enabled: boolean, label: string, value: string | number) => {
    if (
      enabled &&
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      lines.push(`${translate(label)}: ${value}`);
    }
  };
  const numberWithUnit = (value: number, unit: string): string =>
    value > 0 ? `${formatNumber.format(value)} ${unit}` : '';

  add(fields.bean_name, 'BEAN_DATA_NAME', bean?.name);
  add(fields.bean_roaster, 'BEAN_DATA_ROASTER', bean?.roaster);

  const originFields = [
    {
      enabled: fields.bean_country,
      key: 'BEAN_DATA_COUNTRY',
      field: 'country',
    },
    { enabled: fields.bean_region, key: 'BEAN_DATA_REGION', field: 'region' },
    {
      enabled: fields.bean_variety,
      key: 'BEAN_DATA_VARIETY',
      field: 'variety',
    },
    {
      enabled: fields.bean_processing,
      key: 'BEAN_DATA_PROCESSING',
      field: 'processing',
    },
  ] as const;
  const origins = bean?.bean_information ?? [];
  const originLines = origins
    .map((origin) =>
      originFields
        .filter(({ enabled, field }) => enabled && origin?.[field]?.trim())
        .map(({ key, field }) => `${translate(key)}: ${origin[field]}`)
        .join(' · '),
    )
    .filter(Boolean);
  originLines.forEach((originLine, index) => {
    lines.push(
      `${originLines.length > 1 ? `${index + 1}. ` : ''}${originLine}`,
    );
  });

  add(
    fields.method_of_preparation,
    'BREW_DATA_PREPARATION_METHOD',
    preparation?.name,
  );
  add(fields.mill, 'BREW_DATA_MILL', mill?.name);
  add(fields.grind_size, 'BREW_DATA_GRIND_SIZE', brew.grind_size);
  add(
    fields.grind_weight,
    'BREW_DATA_GRIND_WEIGHT',
    numberWithUnit(brew.grind_weight, 'g'),
  );
  add(
    fields.brew_quantity,
    'BREW_DATA_BREW_QUANTITY',
    numberWithUnit(
      brew.brew_quantity,
      BREW_QUANTITY_TYPES_ENUM[brew.brew_quantity_type],
    ),
  );
  add(
    fields.brew_beverage_quantity,
    'BREW_DATA_BREW_BEVERAGE_QUANTITY',
    numberWithUnit(
      brew.brew_beverage_quantity,
      BREW_QUANTITY_TYPES_ENUM[brew.brew_beverage_quantity_type],
    ),
  );
  add(
    fields.brew_temperature,
    'BREW_DATA_BREW_TEMPERATURE',
    numberWithUnit(brew.brew_temperature, '°C'),
  );
  add(
    fields.brew_time,
    'BREW_DATA_TIME',
    brew.brew_time > 0 ? brew.getFormattedTotalCoffeeBrewTime() : '',
  );
  add(
    fields.rating,
    'BREW_DATA_RATING',
    brew.rating > 0 ? formatNumber.format(brew.rating) : '',
  );
  add(fields.note, 'BREW_DATA_NOTES', brew.note);

  return lines.join('\n');
}
