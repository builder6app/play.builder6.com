export class CreatePageDto {
  code: string;
  id?: string; // Optional: ID of the page being edited
  projectId?: string;
  name?: string;
  metaTitle?: string;
  slug?: string;
  addToNavigation?: boolean;
}
