import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import awsS3bucket from '../../helpers/aws.s3';
import { readFileSync } from 'fs';
import {
  FileUploadRequestDto,
  FileUploadUrlRequestDto,
} from '../../dto/request/file-upload-request';
import {
  FilePreviewUrlResponseDto,
  FileUploadResponseDto,
  FileUploadUrlResponseDto,
} from '../../dto/response/file-upload-response';
import { getPagination } from '../../helpers/utils';
import { ApplicationFile } from '../../model/application-files.model';
import {
  Country,
  Group,
  Lga,
  State,
  Ward,
  Zone,
  TestNin,
  Role,
  User,
} from '../../model';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BaseRequestDto } from '../../dto/request/base-request-dto';
import {
  ResultResponseDto,
  RequestResponseDto,
} from '../../dto/response/base-response-dto';
import {
  ListLgabyStateRequestDto,
  ListStatebyCountryRequestDto,
  ListStateByZoneRequestDto,
} from '../../dto/request/list-regions-request.dto';
import NinHelper from '../../helpers/nin.helper';
import { classes, envs } from '../../constructs';
import {
  ListPhcsOptionRequestDto,
  ListRolesOptionRequestDto,
  UploadNinRequestDto,
} from '../../dto/request/index-request.dto';
import { MESSAGES } from '../../constructs/messages';
import { TokenKeys, Tokens } from '../../helpers/token';
import axios from 'axios';
import { AuthUserDto } from '../../dto/others/auth.response.dto';
import { ActionList } from '../../middlewares/actions';

@Injectable()
export class IndexService {
  private readonly ninHelper: NinHelper;

  constructor(
    @InjectRepository(TestNin)
    private readonly testNinRepository: Repository<TestNin>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Lga) private readonly lgaRepository: Repository<Lga>,
    @InjectRepository(Ward) private readonly wardRepository: Repository<Ward>,
    @InjectRepository(Zone) private readonly zoneRepository: Repository<Zone>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly tokens: Tokens,
  ) {
    // Initialize the helper with the repository
    this.ninHelper = new NinHelper(this.testNinRepository);
  }

  protected quotes: {
    quote: string;
    source: string;
    citation?: string;
    year?: string;
  }[] = [
    {
      quote:
        "Be who you are and say what you feel, because those who mind don't matter and those who matter don't mind.",
      source: 'Dr. Seuss',
    },
    {
      quote: 'This too, shall pass.',
      source: 'Anonymous',
    },
    {
      quote: 'Keep your eyes on the stars and your feet on the ground.',
      source: 'Theodore Roosevelt',
    },
    {
      quote:
        'The only person you should try to be better than is the person you were yesterday.',
      source: 'Anonymous',
    },
    {
      quote:
        "Never be bullied into silence. Never allow yourself to be made a victim. Accept no one's definition of your life; define yourself.",
      source: 'Harvey Fierstein',
    },
    {
      quote:
        'Faith is the art of holding on to things your reason has once accepted, in spite of your changing moods.',
      source: 'C.S. Lewis',
    },
    {
      quote:
        'A man who flies from his fear may find that he has only taken a shortcut to meet it.',
      source: 'Sador',
      citation: 'Children of Húrin',
    },
    {
      quote: "Life's too mysterious to take too serious.",
      source: 'Mary Engelbreit',
    },
    {
      quote: 'No one can make you feel inferior without your consent.',
      source: 'Eleanor Roosevelt',
    },
    {
      quote:
        'The woman who follows the crowd will usually go no further than the crowd. The woman who walks alone is likely to find herself in places no one has been before.',
      source: 'Albert Einstein',
    },
    {
      quote:
        "You can't go around building a better world for people. Only people can build a better world for people. Otherwise it's just a cage.",
      source: 'Terry Pratchett',
      citation: 'Witches Abroad',
      year: '1991',
    },
    {
      quote:
        "There isn't a way things should be. There's just what happens, and what we do.",
      source: 'Terry Pratchett',
      citation: 'A Hat Full of Sky',
    },
    {
      quote:
        "It's not about how hard you can hit; it's about how hard you can get hit and keep moving forward.",
      source: 'Rocky Balboa',
      citation: 'Rocky',
      year: '1976',
    },
    {
      quote: 'More fuck yeah, less fuck that.',
      source: 'Anonymous',
    },
    {
      quote:
        'If you want to go fast, go alone. If you want to go far, go together.',
      source: 'African proverb',
    },
    {
      quote: "It's OK to not be OK, as long as you don't stay that way.",
      source: 'Anonymous',
    },
    {
      quote:
        'I can be changed by what happens to me but I refuse to be reduced by it.',
      source: 'Maya Angelou',
    },
    {
      quote: "Believe you can and you're halfway there.",
      source: 'T. Roosevelt',
    },
    {
      quote:
        'May I never be complete. May I never be content. May I never be perfect.',
      source: 'Chuck Palahniuk',
    },
    {
      quote:
        'Nothing in life is to be feared; it is only to be understood. Now is the time to understand more so that we may fear less.',
      source: 'Marie Curie',
    },
    {
      quote: "Those who don't believe in magic will never find it.",
      source: 'Roald Dahl',
    },
    {
      quote: 'There is no elevator to success  you have to take the stairs.',
      source: 'Anonymous',
    },
    {
      quote:
        'Plant your garden and decorate your own soul, instead of waiting for someone to bring you flowers.',
      source: 'Jose Luis Borges',
    },
    {
      quote: 'It does not do to dwell on dreams and forget to live.',
      source: 'Albus Dumbledore',
      citation: "Harry Potter and the Sorcerer's Stone",
      year: '1997',
    },
    {
      quote: "Don't sweat the petty things and don't pet the sweaty things.",
      source: 'George Carlin',
    },
    {
      quote:
        "Do what you feel in your heart to be right, for you'll be criticized anyway.",
      source: 'Eleanor Roosevelt',
    },
    {
      quote: 'Do not set yourself on fire in order to keep others warm.',
      source: 'Anonymous',
    },
    {
      quote:
        "The way I see it, every life is a pile of good things and bad things. The good things don't always soften the bad things, but vice versa, the bad things don't always spoil the good things and make them unimportant.",
      source: 'Doctor Who',
    },
    {
      quote: "It's supposed to be hard. If it were easy, everyone would do it.",
      source: 'Jimmy Dugan',
      citation: 'A League of Their Own',
    },
    {
      quote:
        "Ask yourself if what you're doing today will get you closer to where you want to be tomorrow.",
      source: 'Anonymous',
    },
    {
      quote:
        "Life may not be the party we hoped for, but while we're here, we should dance.",
      source: 'Anonymous',
    },
    {
      quote: 'Never cowardly or cruel. Never give up, never give in.',
      source: 'Doctor Who',
    },
    {
      quote:
        'Do not go where the path may lead, go instead where there is no path and leave a trail.',
      source: 'Ralph Waldo Emerson',
    },
    {
      quote: "In 20 years, you probably won't even remember this.",
      source: 'Anonymous',
    },
    {
      quote: 'Love all, trust a few, do wrong to none.',
      source: 'William Shakespeare',
    },
    {
      quote: "Clear eyes, full hearts, can't lose.",
      source: 'Dillon Panthers',
      citation: 'Friday Night Lights',
      year: '1990',
    },
    {
      quote:
        'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
      source: 'Aristotle',
    },
  ];

  // Accessing the 'version' property from package.json
  getVersionNumber(): any {
    const packageJsonContents = readFileSync('package.json', 'utf8');
    const packageJson = JSON.parse(packageJsonContents);
    if (packageJson) {
      const { name, version } = packageJson;
      return { name, version };
    } else {
      return { name: null, version: null };
    }
  }

  //Function to randomly select a quote value and return a random quote object from the quotes array
  private getRandomIndex() {
    const randomNumber = Math.floor(Math.random() * this.quotes.length);
    const randomIndex = this.quotes[randomNumber];
    return randomIndex;
  }

  getIndex(): any {
    return this.getRandomIndex();
  }

  async fileUpload(data: FileUploadRequestDto): Promise<FileUploadResponseDto> {
    try {
      const uploadedData = await awsS3bucket.uploadFile(
        data.base64File.replace(`data:${data.mimeType};base64,`, ''),
        data.mimeType,
        data.fileName,
      );

      const file = ApplicationFile.create({
        name: data.fileName,
        mimeType: data.mimeType,
        key: uploadedData.key,
        eTag: uploadedData?.eTag ? JSON.parse(uploadedData.eTag) : null,
      });
      await ApplicationFile.save(file);

      return new FileUploadResponseDto(file);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async fileUploadUrl(
    data: FileUploadUrlRequestDto,
  ): Promise<FileUploadUrlResponseDto> {
    try {
      const uploadedData = await awsS3bucket.generateUploadUrl(data.fileName);

      const file = ApplicationFile.create({
        name: data.fileName,
        mimeType: data.mimeType,
        key: uploadedData.key,
        eTag: 'no-tag',
      });
      await ApplicationFile.save(file);

      return new FileUploadUrlResponseDto(file, uploadedData.url);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async filePreviewUrl(fileId: number): Promise<FilePreviewUrlResponseDto> {
    try {
      const file = await ApplicationFile.findOneBy({ id: fileId });
      if (!file) {
        throw new NotFoundException(MESSAGES.record_not_found);
      }
      // Generate the file preview url based on the file key stored in the db
      const previewUrl = await awsS3bucket.getPresignedUrl(file.key);
      return new FilePreviewUrlResponseDto(previewUrl);
    } catch (error: any) {
      console.error('Error generating file preview url:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async listStates(data: BaseRequestDto): Promise<ResultResponseDto> {
    const search = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;
    const query = this.stateRepository.createQueryBuilder('state');
    query.where(`is_active = :isActive`, { isActive: true });

    if (search) {
      query.andWhere(
        `(state.stateName ILIKE :search OR state.stateCode ILIKE :search)`,
        { search: `%${search}%` },
      );
    }
    // Pagination and sorting
    query.orderBy('state.stateName', 'ASC').take(limit).skip(offset);
    const [result, count] = await query.getManyAndCount();
    return {
      result,
      pagination: getPagination(count, page, offset, limit),
    };
  }
  async listCountry(data: BaseRequestDto): Promise<ResultResponseDto> {
    const search = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;
    const query = this.countryRepository.createQueryBuilder('country');
    query.where(`is_active = :isActive`, { isActive: true });

    if (search) {
      query.andWhere(
        `(country.countryName ILIKE :search OR 
          country.alpha3code ILIKE :search)`,
        { search: `%${search}%` },
      );
    }
    // Pagination and sorting
    query.orderBy('country.countryName', 'ASC').take(limit).skip(offset);
    const [result, count] = await query.getManyAndCount();
    return {
      result,
      pagination: getPagination(count, page, offset, limit),
    };
  }
  async listLga(data: BaseRequestDto): Promise<ResultResponseDto> {
    const search = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;
    const query = this.lgaRepository.createQueryBuilder('lga');
    query.where(`is_active = :isActive`, { isActive: true });

    if (search) {
      query.andWhere(`(lga.lgaName ILIKE :search)`, { search: `%${search}%` });
    }
    // Pagination and sorting
    query.orderBy('lga.lgaName', 'ASC').take(limit).skip(offset);
    const [result, count] = await query.getManyAndCount();
    return {
      result,
      pagination: getPagination(count, page, offset, limit),
    };
  }
  async listZone(data: BaseRequestDto): Promise<ResultResponseDto> {
    const search = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;
    const query = this.zoneRepository.createQueryBuilder('zone');
    query.where(`is_active = :isActive`, { isActive: true });

    if (search) {
      query.andWhere(`(zone.zoneName ILIKE :search)`, {
        search: `%${search}%`,
      });
    }
    // Pagination and sorting
    query.orderBy('zone.zoneName', 'ASC').take(limit).skip(offset);
    const [result, count] = await query.getManyAndCount();
    return {
      result,
      pagination: getPagination(count, page, offset, limit),
    };
  }

  async listStatebyCountry(
    data: ListStatebyCountryRequestDto,
  ): Promise<ResultResponseDto> {
    const countryId = data.countryId;
    const search = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;
    const query = this.stateRepository.createQueryBuilder('state');
    query.where(
      'state.country_id = :countryId AND state.is_active = :isActive',
      { countryId, isActive: true },
    );

    if (search) {
      query.andWhere(
        `(state.stateName ILIKE :search OR 
          state.stateCode ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    // Pagination and sorting
    query.orderBy('state.stateName', 'ASC').take(limit).skip(offset);

    const [result, count] = await query.getManyAndCount();
    return {
      result,
      pagination: getPagination(count, page, offset, limit),
    };
  }

  async listStatebyZone(
    data: ListStateByZoneRequestDto,
  ): Promise<ResultResponseDto> {
    const zoneId = data.zoneId;
    const search = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;

    const query = this.stateRepository.createQueryBuilder('state');
    query.where('state.zone_id = :zoneId AND state.is_active = :isActive', {
      zoneId,
      isActive: true,
    });

    if (search) {
      query.andWhere(
        `(state.stateName ILIKE :search OR 
          state.stateCode ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    // Pagination and sorting
    query.orderBy('state.stateName', 'ASC').take(limit).skip(offset);

    const [result, count] = await query.getManyAndCount();
    return {
      result,
      pagination: getPagination(count, page, offset, limit),
    };
  }
  async listLgabyState(
    data: ListLgabyStateRequestDto,
  ): Promise<ResultResponseDto> {
    const stateId = data.stateId;
    const search = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;

    const query = this.lgaRepository.createQueryBuilder('lga');
    query.where('lga.state_id = :stateId AND lga.is_active = :isActive', {
      stateId,
      isActive: true,
    });

    if (search) {
      query.andWhere(`(lga.lgaName ILIKE :search)`, { search: `%${search}%` });
    }

    // Pagination and sorting
    query.orderBy('lga.lgaName', 'ASC').take(limit).skip(offset);

    const [result, count] = await query.getManyAndCount();
    return {
      result,
      pagination: getPagination(count, page, offset, limit),
    };
  }

  async listGroup(
    data: BaseRequestDto,
    user: AuthUserDto,
  ): Promise<ResultResponseDto> {
    const search = data.search || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;

    const scopeLevel = user?.role?.group?.scopeLevel;
    const query = this.groupRepository.createQueryBuilder('group');
    if (scopeLevel) {
      query.where('group.scopeLevel >= :scopeLevel', { scopeLevel });
    }

    if (search) {
      query.andWhere(`(group.groupName ILIKE :search)`, {
        search: `%${search}%`,
      });
    }

    // Pagination and sorting
    query.orderBy('group.groupName', 'ASC').take(limit).skip(offset);
    query.select(['group.id', 'group.groupName']);

    const [result, count] = await query.getManyAndCount();
    return {
      result,
      pagination: getPagination(count, page, offset, limit),
    };
  }

  async uploadNin(data: UploadNinRequestDto): Promise<RequestResponseDto> {
    const done = await this.ninHelper.createOrUpdateNin(data.nin, data.ninData);
    return {
      success: done,
      message: done ? 'NIN uploaded' : 'Failed to upload nin',
    };
  }

  async verifyNin(nin: string): Promise<classes.NinObject> {
    this.ninHelper.setNin(nin);
    // Fetch data
    const ninData = await this.ninHelper.fetchNinData();
    return ninData;
  }

  async listActions(user: AuthUserDto): Promise<string[]> {
    try {
      if (user?.role) {
        const uniqueActions = Array.from(
          new Set(user?.role?.permission?.accesses.flatMap((p) => p.actions)),
        );

        return uniqueActions;
      }
      return Object.values(ActionList);
    } catch (error: any) {
      console.error('Error fetching actions:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async listRoles(
    data: ListRolesOptionRequestDto,
    user: AuthUserDto,
  ): Promise<ResultResponseDto> {
    const search = data.search || null;
    const groupId = data.groupId || null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;

    try {
      const whereConditions: any = {};
      if (search) {
        whereConditions.roleName = ILike(`%${search}%`);
      }

      if (groupId) {
        whereConditions.group = { id: groupId };
      }

      const [roles, totalCount] = await Role.findAndCount({
        where: whereConditions,
        select: ['id', 'roleName'],
        take: limit,
        skip: offset,
      });

      return {
        result: roles,
        pagination: getPagination(totalCount, page, offset, limit),
      };
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async validateUserEmail(
    email: string,
  ): Promise<{ isTwoFactorEnabled: boolean }> {
    const user = await User.findOne({
      where: { emailAddress: email },
      select: ['isTwoFactorEnabled'],
    });
    if (!user) {
      throw new NotFoundException('Account not found');
    }
    return {
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    };
  }
}
