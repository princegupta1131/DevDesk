import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileJson,
    FileSpreadsheet,
    FileText,
    Code,
    GitCompare,
    Home,
} from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const navigate = useNavigate();

    const runCommand = React.useCallback((command: () => void) => {
        onOpenChange(false);
        command();
    }, [onOpenChange]);

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/'))}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        <span>Home</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Converters">
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/app/json-csv'))}
                    >
                        <FileJson className="mr-2 h-4 w-4" />
                        <span>JSON ↔ CSV Converter</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/app/json-excel'))}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        <span>JSON ↔ Excel Converter</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/app/excel-csv'))}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        <span>Excel ↔ CSV Converter</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/app/word-pdf'))}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Word ↔ PDF Converter</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Tools">
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/app/json-viewer'))}
                    >
                        <Code className="mr-2 h-4 w-4" />
                        <span>JSON Viewer</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/app/diff-checker'))}
                    >
                        <GitCompare className="mr-2 h-4 w-4" />
                        <span>Diff Checker</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}

export function useCommandPalette() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return { open, setOpen };
}
