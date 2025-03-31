'use client';

interface MouldingSelectorProps {
  selected: string;
  onSelect: (mouldingType: string) => void;
}

type MouldingOption = {
  id: string;
  name: string;
  description: string;
};

export default function MouldingSelector({ selected, onSelect }: MouldingSelectorProps) {
  const mouldingOptions: MouldingOption[] = [
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional double-framed design',
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean horizontal lines with center accent',
    },
    {
      id: 'geometric',
      name: 'Geometric',
      description: 'Diamond pattern for visual interest',
    },
    {
      id: 'diamond',
      name: 'Diamond',
      description: 'Diamond shaped accent with clean edges',
    },
    {
      id: 'grid',
      name: 'Grid',
      description: 'Simple grid pattern for a structured look',
    },
    {
      id: 'chevron',
      name: 'Chevron',
      description: 'V-shaped pattern for dynamic style',
    },
    {
      id: 'rectangular',
      name: 'Rectangular',
      description: 'Nested rectangular frames for depth',
    },
    {
      id: 'herringbone',
      name: 'Herringbone',
      description: 'Zigzag pattern for a dynamic look',
    },
    {
      id: 'coffered',
      name: 'Coffered',
      description: 'Grid pattern with raised panels for dimension',
    },
    {
      id: 'wainscoting',
      name: 'Wainscoting',
      description: 'Classic lower wall paneling design',
    },
    {
      id: 'shiplap',
      name: 'Shiplap',
      description: 'Horizontal wooden boards pattern',
    },
    {
      id: 'diagonalCross',
      name: 'Diagonal Cross',
      description: 'X-pattern with horizontal and vertical bars',
    },
    {
      id: 'verticalSlat',
      name: 'Vertical Slat',
      description: 'Vertical boards for height and texture',
    },
    {
      id: 'geometricSquares',
      name: 'Geometric Squares',
      description: 'Grid of framed squares for modern appeal',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Moulding Design</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {mouldingOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`
              cursor-pointer border rounded-md p-3 transition
              ${selected === option.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="font-medium">{option.name}</div>
            <div className="text-sm text-gray-500">{option.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 