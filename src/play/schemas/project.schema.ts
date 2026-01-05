export class Project {
  _id?: string;
  name: string;
  description?: string;
  
  // Steedos Standard Fields
  owner?: string;
  created: Date;
  created_by?: string;
  modified: Date;
  modified_by?: string;
}
