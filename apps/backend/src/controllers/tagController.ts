import { Request, Response } from 'express';
import { TagRepository } from '../repositories/tagRepository';

export class TagController {
  constructor(private tagRepository: TagRepository) {}

  getAllTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const { withCount } = req.query;
      
      let tags;
      if (withCount === 'true') {
        tags = await this.tagRepository.findWithProductCount();
      } else {
        tags = await this.tagRepository.findAll();
      }
      
      res.json({
        success: true,
        data: tags
      });
    } catch (error) {
      console.error('Error getting tags:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get tags',
        message: 'An error occurred while retrieving tags' 
      });
    }
  };

  getTagById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tagId = parseInt(id);

      if (isNaN(tagId)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid tag ID',
          message: 'Tag ID must be a number' 
        });
        return;
      }

      const tag = await this.tagRepository.findById(tagId);
      
      if (!tag) {
        res.status(404).json({ 
          success: false, 
          error: 'Tag not found',
          message: `Tag with ID ${tagId} not found` 
        });
        return;
      }

      res.json({
        success: true,
        data: tag
      });
    } catch (error) {
      console.error('Error getting tag by ID:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get tag',
        message: 'An error occurred while retrieving the tag' 
      });
    }
  };

  createTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid input',
          message: 'Tag name is required and must be a string' 
        });
        return;
      }

      // Check if tag already exists
      const existingTag = await this.tagRepository.findByName(name.trim());
      if (existingTag) {
        res.status(409).json({ 
          success: false, 
          error: 'Tag already exists',
          message: `Tag with name "${name}" already exists` 
        });
        return;
      }

      const tag = await this.tagRepository.create(name.trim());
      
      res.status(201).json({
        success: true,
        data: tag,
        message: 'Tag created successfully'
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create tag',
        message: 'An error occurred while creating the tag' 
      });
    }
  };

  updateTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const tagId = parseInt(id);

      if (isNaN(tagId)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid tag ID',
          message: 'Tag ID must be a number' 
        });
        return;
      }

      if (!name || typeof name !== 'string') {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid input',
          message: 'Tag name is required and must be a string' 
        });
        return;
      }

      // Check if another tag with this name already exists
      const existingTag = await this.tagRepository.findByName(name.trim());
      if (existingTag && existingTag.id !== tagId) {
        res.status(409).json({ 
          success: false, 
          error: 'Tag name already exists',
          message: `Another tag with name "${name}" already exists` 
        });
        return;
      }

      const tag = await this.tagRepository.update(tagId, name.trim());
      
      if (!tag) {
        res.status(404).json({ 
          success: false, 
          error: 'Tag not found',
          message: `Tag with ID ${tagId} not found` 
        });
        return;
      }

      res.json({
        success: true,
        data: tag,
        message: 'Tag updated successfully'
      });
    } catch (error) {
      console.error('Error updating tag:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update tag',
        message: 'An error occurred while updating the tag' 
      });
    }
  };

  deleteTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tagId = parseInt(id);

      if (isNaN(tagId)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid tag ID',
          message: 'Tag ID must be a number' 
        });
        return;
      }

      const success = await this.tagRepository.delete(tagId);
      
      if (!success) {
        res.status(404).json({ 
          success: false, 
          error: 'Tag not found',
          message: `Tag with ID ${tagId} not found` 
        });
        return;
      }

      res.json({
        success: true,
        message: 'Tag deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting tag:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete tag',
        message: 'An error occurred while deleting the tag' 
      });
    }
  };

}