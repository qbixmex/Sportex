import { use, act } from 'react';
import { render, screen } from '@testing-library/react';
import { FormFields } from '@/app/admin/equipos/(components)/form-fields';

const { shouldSuspend } = vi.hoisted(() => ({
  shouldSuspend: { value: false },
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/name-and-permalink-fields', () => ({
  NameAndPermalinkFields: () => <div data-testid="name-and-permalink-fields" />,
}));

vi.mock('@/app/admin/equipos/(components)/field-skeleton', () => ({
  FieldSkeleton: () => <div data-testid="field-skeleton" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/format-select-field', () => ({
  FormatSelectField: () => <div data-testid="format-select-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/image-field', () => ({
  ImageField: () => <div data-testid="image-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/gender-select', () => ({
  GenderSelect: () => <div data-testid="gender-select" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/country-field', () => ({
  CountryField: () => <div data-testid="country-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/state-field', () => ({
  StateField: () => <div data-testid="state-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/city-field', () => ({
  CityField: () => <div data-testid="city-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/emails-field', () => ({
  EmailsField: () => <div data-testid="emails-field" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/address-text-area', () => ({
  AddressTextArea: () => <div data-testid="address-text-area" />,
}));

vi.mock('@/app/admin/equipos/(components)/form-fields/active-switch', () => ({
  ActiveSwitch: () => <div data-testid="active-switch" />,
}));

const slots = {
  tournamentSlot: <div data-testid="tournament-slot" />,
  categorySlot: <div data-testid="category-slot" />,
  coachesSlot: <div data-testid="coaches-slot" />,
  fieldsSlot: <div data-testid="fields-slot" />,
};

const AssertionList = [
  'name-and-permalink-fields',
  'format-select-field',
  'image-field',
  'gender-select',
  'country-field',
  'state-field',
  'city-field',
  'emails-field',
  'address-text-area',
  'active-switch',
  'tournament-slot',
  'category-slot',
  'coaches-slot',
  'fields-slot',
];

describe('Test on <FormFields />', () => {
  beforeEach(() => {
    shouldSuspend.value = false;
  });

  test('Should render all field components and slots', () => {
    render(<FormFields {...slots} />);

    AssertionList.forEach((testId) => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  test('Should render the skeleton when a slot is suspended', async () => {
    function SuspendingSlot() {
      use(new Promise(() => { }));
      return <div data-testid="suspended-slot" />;
    }

    await act(async () => {
      render(
        <FormFields
          {...slots}
          tournamentSlot={<SuspendingSlot />}
        />,
      );
    });

    expect(screen.getByTestId('field-skeleton')).toBeInTheDocument();
  });
});
