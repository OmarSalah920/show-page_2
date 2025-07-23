import React, { useCallback, useState, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../../components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Checkbox } from "../../../../components/ui/checkbox";
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Play, 
  Pause, 
  Upload, 
  Users, 
  FileText,
  Loader2,
  AlertTriangle,
  Download,
  Edit
} from "lucide-react";

interface AudienceData {
  identifier: string;
  name: string;
  phone: string;
  createdAt: string;
  status: string;
  tries: string;
  result: string;
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
  suggestion?: string;
}

interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicatesRemoved: number;
  timestamp: string;
}

interface PhonebookList {
  id: string;
  name: string;
  contactCount: number;
}

export const AudienceTableSection = (): JSX.Element => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [importOption, setImportOption] = useState<'phonebook' | 'file' | null>(null);
  const [selectedPhonebook, setSelectedPhonebook] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [listName, setListName] = useState<string>('');
  const [listNameError, setListNameError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [audienceData, setAudienceData] = useState<AudienceData[]>([
    {
      identifier: "85151",
      name: "tahani",
      phone: "962770535853",
      createdAt: "May 27, 2025 . 04:38 PM",
      status: "Serviced",
      tries: "1",
      result: "",
    },
    {
      identifier: "2e6f1",
      name: "Noor",
      phone: "962799235768",
      createdAt: "May 27, 2025 . 02:29 PM",
      status: "Serviced",
      tries: "1",
      result: "",
    },
  ]);

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [validRows, setValidRows] = useState<AudienceData[]>([]);

  // Mock phonebook data
  const phonebookLists: PhonebookList[] = [
    { id: '1', name: 'Customer Database', contactCount: 1250 },
    { id: '2', name: 'Sales Prospects', contactCount: 890 },
    { id: '3', name: 'Support Contacts', contactCount: 456 },
    { id: '4', name: 'VIP Clients', contactCount: 78 },
    { id: '5', name: 'Marketing List', contactCount: 2340 },
  ];

  const statsCards = [
    { title: "Audience Count", value: audienceData.length.toString() },
    { title: "Serviced Calls", value: "2" },
    { title: "Failed Calls", value: "0" },
    { title: "Response Rate", value: "100.0%" },
  ];

  // Enhanced validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') return false;
    const cleanPhone = phone.toString().replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // Must be between 10-15 digits (with or without + prefix)
    const phoneRegex = /^(\+?\d{10,15})$/;
    return phoneRegex.test(cleanPhone);
  };

  const validateName = (name: string): boolean => {
    if (!name || typeof name !== 'string') return false;
    const trimmedName = name.toString().trim();
    return trimmedName.length > 0 && trimmedName.length <= 100;
  };

  const validateHeaders = (headers: string[]): boolean => {
    if (!headers || headers.length !== 2) return false;
    const normalizedHeaders = headers.map(h => h.toString().toLowerCase().trim());
    return normalizedHeaders.includes('name') && normalizedHeaders.includes('phone');
  };

  const validateListName = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'Please enter a list name';
    }
    if (trimmed.length < 2) {
      return 'List name must be at least 2 characters';
    }
    if (trimmed.length > 50) {
      return 'List name must be 50 characters or less';
    }
    return '';
  };

  const standardizePhoneNumber = (phone: string): string => {
    const digits = phone.toString().replace(/\D/g, '');
    
    // If already starts with 962, keep as is
    if (digits.startsWith('962')) {
      return digits;
    }
    
    // If starts with 0, replace with 962
    if (digits.startsWith('0')) {
      return `962${digits.substring(1)}`;
    }
    
    // Otherwise, assume it's a local number and add 962
    return `962${digits}`;
  };

  const standardizeCreatedAt = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
    
    return `${month} ${day}, ${year} . ${formattedHours}:${minutes} ${period}`;
  };

  const getErrorSuggestion = (field: string, value: string, error: string): string => {
    if (field === 'phone') {
      if (error.includes('required')) {
        return 'Provide a valid phone number';
      }
      if (error.includes('format')) {
        return 'Use format: +962771234567 or 0771234567 (10-15 digits)';
      }
    }
    if (field === 'name') {
      if (error.includes('required')) {
        return 'Enter a contact name (1-100 characters)';
      }
      if (error.includes('long')) {
        return 'Name must be 100 characters or less';
      }
    }
    return 'Please correct this field according to the requirements';
  };

  const resetImportState = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setValidationErrors([]);
    setValidRows([]);
    setImportSummary(null);
    setImportOption(null);
    setSelectedPhonebook('');
    setSelectedFile(null);
    setListName('');
    setListNameError('');
    setIsLoading(false);
    setIsDragOver(false);
    setShowErrorModal(false);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setListNameError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      // Validate list name when file is dropped
      if (!listName.trim()) {
        setListNameError('Please enter a list name');
      }
    }
  };

  const handleListNameChange = (value: string) => {
    setListName(value);
    // Clear error when user starts typing
    if (listNameError && value.trim()) {
      setListNameError('');
    }
    // Validate in real-time
    const error = validateListName(value);
    setListNameError(error);
  };

  const downloadSampleFile = () => {
    // Create sample data based on the attached CSV
    const sampleData = [
      ['Name', 'Phone number'],
      ['Fouad', '97123456789'],
      ['David', '97123344567'],
      ['Ali', '96623344555'],
      ['John', '+12345678910']
    ];

    // Convert to CSV format
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'Contacts Sample.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Sample file downloaded successfully');
  };

  const processFile = (file: File) => {
    console.log('Processing file:', file.name);
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) {
        toast.error('Failed to read file');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Reading file data...');
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        console.log('Raw data:', rawData);
        
        if (rawData.length < 2) {
          toast.error('File is empty or contains no data rows');
          setIsLoading(false);
          return;
        }

        const headers = rawData[0];
        console.log('Headers:', headers);
        
        if (!validateHeaders(headers)) {
          toast.error('Invalid headers. File must contain exactly two columns named "name" and "phone"');
          setIsLoading(false);
          return;
        }

        // Reset previous validation results
        setValidationErrors([]);
        setValidRows([]);
        
        const errors: ValidationError[] = [];
        const valid: AudienceData[] = [];
        const dataRows = rawData.slice(1); // Skip header row

        console.log('Processing', dataRows.length, 'data rows...');

        // Track duplicates by phone number and name combination
        const seenContacts = new Map<string, number>();
        const duplicateContactKeys = new Set<string>();
        let duplicatesCount = 0;

        // Process each data row
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const rowNumber = i + 2; // +2 because we start from row 2 (after header)
          
          // Skip completely empty rows
          if (!row || (Array.isArray(row) && row.every(cell => !cell || cell.toString().trim() === ''))) {
            continue;
          }

          console.log(`Processing row ${rowNumber}:`, row);

          const [nameValue, phoneValue] = row;
          let hasRowError = false;
          
          // Check for duplicates (normalize phone and name for comparison)
          if (nameValue && phoneValue) {
            const normalizedPhone = standardizePhoneNumber(phoneValue.toString());
            const normalizedName = nameValue.toString().trim().toLowerCase();
            const contactKey = `${normalizedName}|${normalizedPhone}`;
            
            if (seenContacts.has(contactKey)) {
              // This is a duplicate - skip it entirely and count it
              duplicatesCount++;
              duplicateContactKeys.add(contactKey);
              continue; // Skip processing this duplicate row
            } else {
              seenContacts.set(contactKey, rowNumber);
            }
          }

          // Validate name
          if (!validateName(nameValue)) {
            const error = !nameValue || nameValue.toString().trim() === '' 
              ? 'Name is required' 
              : nameValue.toString().length > 100 
                ? 'Name is too long (max 100 characters)'
                : 'Invalid name format';
            
            errors.push({
              row: rowNumber,
              field: 'name',
              value: nameValue ? nameValue.toString() : '(empty)',
              error,
              suggestion: getErrorSuggestion('name', nameValue ? nameValue.toString() : '', error)
            });
            hasRowError = true;
          }

          // Validate phone
          if (!validatePhoneNumber(phoneValue)) {
            const error = !phoneValue || phoneValue.toString().trim() === ''
              ? 'Phone number is required'
              : 'Phone number must be in valid format (10-15 digits)';
            
            errors.push({
              row: rowNumber,
              field: 'phone',
              value: phoneValue ? phoneValue.toString() : '(empty)',
              error,
              suggestion: getErrorSuggestion('phone', phoneValue ? phoneValue.toString() : '', error)
            });
            hasRowError = true;
          }

          // If no errors, add to valid rows
          if (!hasRowError) {
            valid.push({
              identifier: Math.random().toString(36).substr(2, 5),
              name: nameValue.toString().trim(),
              phone: standardizePhoneNumber(phoneValue.toString()),
              createdAt: standardizeCreatedAt(new Date()),
              status: "Pending",
              tries: "0",
              result: "",
            });
          }
        }


        console.log('Validation complete. Errors:', errors.length, 'Valid:', valid.length);

        if (errors.length > 0) {
          // Create import summary only for error cases
          const summary: ImportSummary = {
            totalRows: dataRows.filter(row => row && !row.every(cell => !cell || cell.toString().trim() === '')).length,
            validRows: valid.length,
            invalidRows: errors.length,
            duplicatesRemoved: duplicatesCount,
            timestamp: new Date().toLocaleString()
          };

          setImportSummary(summary);
          setValidationErrors(errors);
          setValidRows(valid);
          setIsLoading(false);
          console.log('Showing error modal with', errors.length, 'errors');
          setShowErrorModal(true);
        } else {
          // All rows are valid - import directly
          const summary: ImportSummary = {
            totalRows: dataRows.filter(row => row && !row.every(cell => !cell || cell.toString().trim() === '')).length,
            validRows: valid.length,
            invalidRows: 0,
            duplicatesRemoved: duplicatesCount,
            timestamp: new Date().toLocaleString()
          };
          
          setIsLoading(false);
          
          // Capture list name before resetting state
          const currentListName = listName;
          
          setAudienceData(prev => [...prev, ...valid]);
          
          // Force close modal and reset all state
          setShowImportModal(false);
          resetImportState();
          
          // Show success message after state is reset
          const duplicateMessage = duplicatesCount > 0 ? ` (${duplicatesCount} duplicates removed)` : '';
          toast.success(`Successfully imported ${valid.length} contacts to "${currentListName}"${duplicateMessage}`);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Error processing file. Please check the file format.');
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Error reading file');
      setIsLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Validate list name when file is selected
    if (!listName.trim()) {
      setListNameError('Please enter a list name');
    }
  }, [listName]);

  const handlePhonebookImport = async () => {
    if (!selectedPhonebook) {
      toast.error('Please select a phonebook list');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const selectedList = phonebookLists.find(list => list.id === selectedPhonebook);
      if (selectedList) {
        // Mock imported data
        const mockData: AudienceData[] = Array.from({ length: Math.min(selectedList.contactCount, 10) }, (_, i) => ({
          identifier: Math.random().toString(36).substr(2, 5),
          name: `Contact ${i + 1}`,
          phone: `96277${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
          createdAt: standardizeCreatedAt(new Date()),
          status: "Pending",
          tries: "0",
          result: "",
        }));

        setAudienceData(prev => [...prev, ...mockData]);
        toast.success(`Successfully imported ${mockData.length} contacts from ${selectedList.name}`);
        setShowImportModal(false);
        resetImportState();
      }
      setIsLoading(false);
    }, 2000);
  };

  const handleImportConfirm = () => {
    if (validRows.length > 0) {
      const duplicateMessage = importSummary?.duplicatesRemoved && importSummary.duplicatesRemoved > 0 
        ? ` (${importSummary.duplicatesRemoved} duplicates removed)` 
        : '';
      setAudienceData(prev => [...prev, ...validRows]);
      toast.success(`Successfully imported ${validRows.length} contacts to "${listName}"${duplicateMessage}`);
    }
    setShowErrorModal(false);
    setShowImportModal(false);
    resetImportState();
  };

  const handlePlayPauseToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFileImport = () => {
    // Validate list name first
    const nameError = validateListName(listName);
    if (nameError) {
      setListNameError(nameError);
      toast.error(nameError);
      return;
    }
    
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    
    console.log('Starting file import for:', selectedFile.name);
    processFile(selectedFile);
  };

  const canProceedWithFileUpload = () => {
    return listName.trim() !== '' && selectedFile !== null && !listNameError;
  };

  const handleCallIdClick = (callId: string) => {
    // Do nothing as requested
    console.log('Call ID clicked:', callId);
  };

  const handleEditCampaign = () => {
    // Placeholder function for edit campaign functionality
    toast.success('Edit Campaign clicked');
    console.log('Edit Campaign button clicked');
  };

  return (
    <section className="w-full bg-neutral-100 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">DirectToNoor</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-8 text-xs gap-2"
              onClick={handleEditCampaign}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Campaign
            </Button>

            <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-8 text-xs gap-2">
                  <div className="w-3.5 h-3.5 bg-[url(/frame-19.svg)] bg-[100%_100%]" />
                  Import Audience
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader className="relative pb-2 pt-2">
                  <DialogTitle className="text-lg font-semibold pr-12 mt-2">Import Audience</DialogTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Start adding contacts to the <span className="font-medium text-gray-800">DirectToNoor</span> campaign
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-0 h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
                    onClick={() => {
                      setShowImportModal(false);
                      resetImportState();
                    }}
                  >
                    <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </Button>
                </DialogHeader>
                
                <div className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Phonebook List
                      </label>
                      <Select value={selectedPhonebook} onValueChange={setSelectedPhonebook}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a phonebook list" />
                        </SelectTrigger>
                        <SelectContent>
                          {phonebookLists.map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                              {list.name} ({list.contactCount} contacts)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bottom buttons section */}
                  <div className="flex justify-end items-center gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowImportModal(false);
                        resetImportState();
                      }}
                    >
                      Cancel
                    </Button>
                    
                    <Button 
                      onClick={handlePhonebookImport}
                      disabled={!selectedPhonebook || isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        'Import'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Enhanced Error Modal */}
            <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0 pb-4 border-b relative">
                  <DialogTitle className="text-lg font-semibold flex items-center gap-2 pr-12">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Import Validation Results
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
                    onClick={() => setShowErrorModal(false)}
                  >
                    <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </Button>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Summary Section */}
                  {importSummary && (
                    <div className="flex-shrink-0 mb-6">
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{importSummary.totalRows}</div>
                          <div className="text-sm text-blue-700 font-medium">Total Contacts</div>
                          <div className="text-xs text-blue-600 mt-1">Processed</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{importSummary.validRows}</div>
                          <div className="text-sm text-green-700 font-medium">Valid Contacts</div>
                          <div className="text-xs text-green-600 mt-1">Ready to import</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-red-600">{importSummary.invalidRows}</div>
                          <div className="text-sm text-red-700 font-medium">Invalid Contacts</div>
                          <div className="text-xs text-red-600 mt-1">Need correction</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">{importSummary.duplicatesRemoved}</div>
                          <div className="text-sm text-orange-700 font-medium">Duplicates Removed</div>
                          <div className="text-xs text-orange-600 mt-1">Automatically filtered</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Details Section */}
                  {validationErrors.length > 0 && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <div className="flex-shrink-0 mb-3">
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Validation Errors ({validationErrors.length})
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          The following rows contain errors that need to be corrected:
                        </p>
                      </div>

                      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                        <div className="divide-y divide-gray-100">
                          {validationErrors.map((error, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-red-600">
                                    {error.row}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-900">
                                      Row {error.row}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                      {error.field}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Value:</span> "{error.value || '(empty)'}"
                                  </div>
                                  <div className="text-sm text-red-600 mb-2">
                                    <span className="font-medium">Error:</span> {error.error}
                                  </div>
                                  {error.suggestion && (
                                    <div className="text-sm text-blue-600 bg-blue-50 rounded px-2 py-1">
                                      <span className="font-medium">Suggestion:</span> {error.suggestion}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {validRows.length > 0 && (
                        <span>Proceeding with {validRows.length} of {importSummary?.totalRows} contacts</span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowErrorModal(false);
                          setShowImportModal(true);
                        }}
                      >
                        Cancel Upload
                      </Button>
                      <Button
                        onClick={handleImportConfirm}
                        disabled={validRows.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Proceed with Valid Contacts ({validRows.length})
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant={isPlaying ? "destructive" : "default"}
              className={`h-8 text-xs gap-2 transition-colors duration-200 ${
                isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={handlePlayPauseToggle}
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {isPlaying ? "Pause" : "Run"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statsCards.map((card, index) => (
            <Card key={index} className="border border-[#f0f0f0]">
              <CardContent className="p-6 flex flex-col items-center">
                <p className="text-2xl font-medium text-[#000000e0] mt-2">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 mt-2">{card.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Audience Table */}
        <Card className="border">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium">Audience</h3>
            <Button variant="outline" className="h-8 text-xs gap-2">
              <div className="w-3.5 h-3.5 bg-[url(/frame-8.svg)] bg-[100%_100%]" />
              Export
            </Button>
          </div>

          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="font-semibold text-xs text-[#000000e0]">
                  Call ID
                </TableHead>
                <TableHead className="font-semibold text-xs text-[#000000e0]">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-xs text-[#000000e0]">
                  Phone
                </TableHead>
                <TableHead className="font-semibold text-xs text-[#000000e0]">
                  Created at
                </TableHead>
                <TableHead className="font-semibold text-xs text-[#000000e0]">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-xs text-[#000000e0]">
                  Number of Tries
                </TableHead>
                <TableHead className="font-semibold text-xs text-[#000000e0]">
                  Result
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audienceData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="text-xs text-[#000000e0]">
                    <button
                      onClick={() => handleCallIdClick(row.identifier)}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {row.identifier}
                    </button>
                  </TableCell>
                  <TableCell className="text-xs text-[#000000e0]">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-xs text-[#000000e0]">
                    <div className="flex items-center">
                      <span className="ml-7">{row.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-[#000000e0]">
                    {row.createdAt}
                  </TableCell>
                  <TableCell className="text-xs text-[#000000e0]">
                    {row.status}
                  </TableCell>
                  <TableCell className="text-xs text-[#000000e0]">
                    {row.tries}
                  </TableCell>
                  <TableCell className="text-xs text-[#000000e0]">
                    {row.result}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-end items-center p-2 border-t">
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#000000e0]">
                • Showing 1-{audienceData.length} of {audienceData.length} items
              </span>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious className="h-8 w-8 p-0" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink className="h-8 w-8 p-0" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext className="h-8 w-8 p-0" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <Select defaultValue="10">
                <SelectTrigger className="w-[101px] h-8">
                  <SelectValue placeholder="10 / page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};